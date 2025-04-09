import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PlayerPassport } from '@/components/dashboard/PlayerPassport';
import { PCPRankings } from '@/components/dashboard/PCPRankings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bolt, BarChart3, Trophy, Award, Star, TrendingUp, Activity, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const [codeCopied, setCodeCopied] = useState(false);
  
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
  const winRate = user.totalMatches ? Math.round((user.matchesWon || 16) / (user.totalMatches || 24) * 100) : 67;
  
  return (
    <DashboardLayout>
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
                        {/* Display raw passport ID without PKL- prefix or dashes */}
                        {user.passportId?.replace(/^PKL-/, '').replace(/-/g, '')}
                      </code>
                      <button 
                        onClick={() => {
                          // Copy the raw passport ID without PKL- prefix or dashes
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
          
          {/* Stats Section */}
          <motion.div 
            className="md:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center mb-3">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                Your Performance Metrics
              </h3>
              <div className="ml-2 text-xs bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-2 py-0.5 rounded-full">
                Live Data
              </div>
            </div>
            
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
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 0.7, duration: 0.3 }}
                              className="font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
                            >
                              1000 XP needed
                            </motion.div>
                          </div>
                        </div>
                        {/* Sparkling progress bar with animated fill */}
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-2 bg-gradient-to-r from-[#FF5722] via-[#FF8C1A] to-[#FFA726] rounded-full relative overflow-hidden"
                            style={{ width: '100%' }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-[#FF5722] via-[#FF8C1A] to-[#FFA726]"
                              initial={{ width: '0%' }}
                              animate={{ width: isLoaded ? `${xpPercentage}%` : '0%' }}
                              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                            />
                            {/* Sparkle effect */}
                            <div className="absolute top-0 bottom-0 left-0 right-0">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute h-1 w-5 bg-white/40 rounded-full"
                                  style={{
                                    left: `${20 + i * 30}%`,
                                    animation: `moveLeftRight ${3 + i}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.5}s`,
                                  }}
                                ></div>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Match Stats Card with radar chart-like visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="shadow-lg border border-gray-100/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2196F3] to-[#03A9F4]"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <span className="bg-gradient-to-br from-[#2196F3] to-[#03A9F4] p-1.5 rounded-lg mr-2 text-white">
                        <BarChart3 size={18} />
                      </span>
                      <span className="bg-gradient-to-r from-[#2196F3] to-[#03A9F4] text-transparent bg-clip-text">
                        Match Statistics
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Total Matches with animated counter */}
                      <motion.div 
                        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: isLoaded ? 0 : -20, opacity: isLoaded ? 1 : 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-bl-3xl"></div>
                        <div className="space-y-1 relative z-10">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
                          <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 0.8, duration: 0.3 }}
                            >
                              {user.totalMatches || 24}
                            </motion.span>
                          </div>
                          <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <TrendingUp size={12} className="mr-1" />
                            <span>+3 this week</span>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Matches Won with animated counter */}
                      <motion.div 
                        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 p-3"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: isLoaded ? 0 : 20, opacity: isLoaded ? 1 : 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-bl-3xl"></div>
                        <div className="space-y-1 relative z-10">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Matches Won</div>
                          <div className="font-bold text-xl bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 0.8, duration: 0.3 }}
                            >
                              {user.matchesWon || 16}
                            </motion.span>
                          </div>
                          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <TrendingUp size={12} className="mr-1" />
                            <span>+2 this week</span>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Win Rate with circular progress */}
                      <motion.div 
                        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 p-3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: isLoaded ? 0 : 20, opacity: isLoaded ? 1 : 0 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-bl-3xl"></div>
                        <div className="flex items-center space-x-2 relative z-10">
                          <div className="relative w-10 h-10">
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
                              {/* Win rate circle with animation */}
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
                                  strokeDashoffset: isLoaded ? 251 - (251 * winRate / 100) : 251
                                }}
                                transition={{ delay: 0.9, duration: 1.5, ease: "easeOut" }}
                                style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                              />
                              {/* Gradient definition */}
                              <defs>
                                <linearGradient id="winRateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#F59E0B" />
                                  <stop offset="100%" stopColor="#FBBF24" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
                            <div className="font-bold text-xl bg-gradient-to-r from-yellow-600 to-amber-600 text-transparent bg-clip-text">
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isLoaded ? 1 : 0 }}
                                transition={{ delay: 0.9, duration: 0.3 }}
                              >
                                {winRate}%
                              </motion.span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Tournaments with trophy icon */}
                      <motion.div 
                        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 p-3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: isLoaded ? 0 : 20, opacity: isLoaded ? 1 : 0 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-bl-3xl"></div>
                        <div className="space-y-1 relative z-10">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Tournaments</div>
                          <div className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text flex items-center">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 0.8, duration: 0.3 }}
                            >
                              {user.totalTournaments || 3}
                            </motion.span>
                            <Trophy size={16} className="ml-1 text-purple-500" />
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            1 upcoming
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* CourtIQ Radar Visualization */}
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
                        <Activity size={18} />
                      </span>
                      <span className="bg-gradient-to-r from-[#673AB7] to-[#9C27B0] text-transparent bg-clip-text">
                        CourtIQ™ Performance
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      {/* Radar chart visualization */}
                      <div className="relative w-40 h-40">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full">
                            {/* Background hexagon */}
                            <svg viewBox="0 0 100 100" className="w-full h-full absolute">
                              <polygon 
                                points="50,10 85,30 85,70 50,90 15,70 15,30" 
                                fill="none" 
                                stroke="#f3f4f6" 
                                strokeWidth="1" 
                              />
                              <polygon 
                                points="50,20 75,35 75,65 50,80 25,65 25,35" 
                                fill="none" 
                                stroke="#f3f4f6" 
                                strokeWidth="1" 
                              />
                              <polygon 
                                points="50,30 65,40 65,60 50,70 35,60 35,40" 
                                fill="none" 
                                stroke="#f3f4f6" 
                                strokeWidth="1" 
                              />
                              
                              {/* Axis labels */}
                              <text x="50" y="5" textAnchor="middle" fill="#94a3b8" fontSize="6">Power</text>
                              <text x="92" y="35" textAnchor="start" fill="#94a3b8" fontSize="6">Speed</text>
                              <text x="92" y="75" textAnchor="start" fill="#94a3b8" fontSize="6">Precision</text>
                              <text x="50" y="98" textAnchor="middle" fill="#94a3b8" fontSize="6">Strategy</text>
                              <text x="8" y="75" textAnchor="end" fill="#94a3b8" fontSize="6">Control</text>
                              <text x="8" y="35" textAnchor="end" fill="#94a3b8" fontSize="6">Consistency</text>
                            </svg>
                            
                            {/* Data hexagon with animation */}
                            <motion.svg 
                              viewBox="0 0 100 100" 
                              className="w-full h-full absolute"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.5 }}
                              transition={{ delay: 1, duration: 0.8 }}
                            >
                              <polygon 
                                points="50,15 80,32 75,70 45,85 20,65 25,30" 
                                fill="url(#radarGradient)" 
                                fillOpacity="0.3" 
                                stroke="url(#radarGradient)" 
                                strokeWidth="2" 
                              />
                              <defs>
                                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#673AB7" />
                                  <stop offset="100%" stopColor="#9C27B0" />
                                </linearGradient>
                              </defs>
                              
                              {/* Skill points */}
                              <circle cx="50" cy="15" r="2.5" fill="#673AB7" />
                              <circle cx="80" cy="32" r="2.5" fill="#7E57C2" />
                              <circle cx="75" cy="70" r="2.5" fill="#9575CD" />
                              <circle cx="45" cy="85" r="2.5" fill="#B39DDB" />
                              <circle cx="20" cy="65" r="2.5" fill="#D1C4E9" />
                              <circle cx="25" cy="30" r="2.5" fill="#EDE7F6" />
                            </motion.svg>
                            
                            {/* Center point */}
                            <motion.div 
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.2, duration: 0.5, type: 'spring' }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#673AB7] to-[#9C27B0] flex items-center justify-center text-white font-bold shadow-lg">
                                <span className="text-sm">1248</span>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Skill attributes visualization */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        { label: 'Power', value: 82, color: 'from-red-500 to-red-700' },
                        { label: 'Control', value: 75, color: 'from-blue-500 to-blue-700' },
                        { label: 'Strategy', value: 88, color: 'from-green-500 to-green-700' }
                      ].map((skill, index) => (
                        <motion.div 
                          key={skill.label}
                          className="space-y-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                          transition={{ delay: 1.4 + (index * 0.1), duration: 0.3 }}
                        >
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{skill.label}</span>
                            <span className="font-medium">{skill.value}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                              initial={{ width: '0%' }}
                              animate={{ width: isLoaded ? `${skill.value}%` : '0%' }}
                              transition={{ delay: 1.5 + (index * 0.1), duration: 1 }}
                            ></motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Quick Access Buttons */}
          <motion.div
            className="md:col-span-12 flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ delay: 1.7, duration: 0.5 }}
          >
            {[
              { icon: <Trophy size={16} />, label: 'Tournaments', color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
              { icon: <Award size={16} />, label: 'Achievements', color: 'bg-gradient-to-r from-emerald-500 to-green-600' },
              { icon: <Star size={16} />, label: 'Leaderboard', color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
              { icon: <Activity size={16} />, label: 'Stats Details', color: 'bg-gradient-to-r from-purple-500 to-pink-600' }
            ].map((button, i) => (
              <motion.button
                key={button.label}
                className={`${button.color} text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + (i * 0.1) }}
              >
                {button.icon}
                <span>{button.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>
      
      {/* CSS Animation is now in index.css */}
    </DashboardLayout>
  );
}