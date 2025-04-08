import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Trophy, Award, Star, Zap, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { User } from '@shared/schema';
import { OfficialPicklePlusWhiteLogo } from '@/components/icons/OfficialPicklePlusLogo';

interface PlayerPassportProps {
  user: User;
}

export function PlayerPassport({ user }: PlayerPassportProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [glowEffect, setGlowEffect] = useState(false);
  
  // Load animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    // Add glow effect periodically
    const glowTimer = setInterval(() => {
      setGlowEffect(true);
      setTimeout(() => setGlowEffect(false), 2000);
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(glowTimer);
    };
  }, []);

  // Generate a QR code containing user's passport ID
  const qrData = JSON.stringify({
    passportId: user.passportId || `PID-${user.id}`,
    username: user.username,
    timestamp: new Date().toISOString()
  });

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
  
  // Calculate dynamic values
  const xpPercentage = Math.min((user.xp || 520) / 10, 100);

  return (
    <div className="w-full max-w-sm mx-auto perspective">
      <motion.div 
        className={`preserve-3d cursor-pointer relative ${isFlipped ? 'passport-card-rotate' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ 
          transformStyle: 'preserve-3d', 
          transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
        }}
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          boxShadow: glowEffect 
            ? [
                '0 0 10px rgba(255, 87, 34, 0.5)', 
                '0 0 20px rgba(255, 87, 34, 0.3)', 
                '0 0 10px rgba(255, 87, 34, 0.5)'
              ] 
            : '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
        transition={{ 
          rotateY: { duration: 0.8 },
          boxShadow: { duration: 1.5, repeat: 0 }
        }}
        whileHover={{ 
          scale: isFlipped ? 1 : 1.02,
          boxShadow: '0 8px 30px rgba(255, 87, 34, 0.2)'
        }}
      >
        {/* Front of passport */}
        <motion.div 
          className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            backgroundImage: 'radial-gradient(circle at 80% 10%, rgba(255, 87, 34, 0.05) 0%, transparent 60%)'
          }}
        >
          {/* Top border accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
          
          {/* Right edge glow */}
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#FF5722]/40 to-transparent"></div>
          
          {/* Bottom edge glow */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-[#FF9800]/40"></div>
          
          {/* Animated corner accents for founding members */}
          {isFoundingMember && (
            <>
              <div className="absolute top-0 left-0 w-8 h-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute top-0 right-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-8 h-8">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute bottom-0 left-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8">
                <div className="absolute bottom-0 right-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute bottom-0 right-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
            </>
          )}
          
          {/* Header with logo and linear gradient */}
          <div className="relative overflow-hidden">
            {/* Background gradient */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#FF5722] to-[#FF9800]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #FF5722, #FF9800),
                  url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
                `
              }}
            ></div>
            
            {/* Animated pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white/20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3], 
                    scale: [0, 1, 0],
                    x: [Math.random() * 100, Math.random() * 200, Math.random() * 300],
                    y: [Math.random() * 50, Math.random() * 100, Math.random() * 150]
                  }}
                  transition={{ 
                    duration: Math.random() * 10 + 15, 
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 8 + 4}px`,
                    height: `${Math.random() * 8 + 4}px`,
                  }}
                />
              ))}
            </div>
            
            {/* Content */}
            <div className="pt-3 pb-5 px-5 text-white relative z-10">
              <div className="flex justify-between items-center">
                <motion.div 
                  className="font-bold text-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -10 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {isFoundingMember ? (
                    <span className="flex items-center">
                      Founding Member
                      <motion.div
                        className="ml-1 text-[#FFD700]"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Star size={14} />
                      </motion.div>
                    </span>
                  ) : (
                    "Player Passport"
                  )}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 10 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <OfficialPicklePlusWhiteLogo className="h-10 w-auto" />
                </motion.div>
              </div>
              
              {/* CourtIQ badge */}
              <motion.div 
                className="absolute top-16 right-4 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center"
                initial={{ opacity: 0, scale: 0.8, y: -5 }}
                animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8, y: isLoaded ? 0 : -5 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.div 
                  className="w-2 h-2 bg-blue-300 rounded-full mr-1"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                ></motion.div>
                Powered by CourtIQ™
              </motion.div>
              
              {/* Player info with animations */}
              <div className="flex items-center mt-4">
                <motion.div 
                  className="relative h-20 w-20 rounded-full bg-white p-0.5 mr-4 shadow-lg"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8, y: isLoaded ? 0 : 10 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {/* Animated ring */}
                  <motion.div 
                    className="absolute -inset-1 rounded-full"
                    style={{
                      background: isFoundingMember 
                        ? 'linear-gradient(45deg, rgba(255,215,0,0.0) 0%, rgba(255,215,0,0.5) 50%, rgba(255,215,0,0) 100%)' 
                        : 'linear-gradient(45deg, rgba(33,150,243,0.0) 0%, rgba(33,150,243,0.5) 50%, rgba(33,150,243,0) 100%)',
                      backgroundSize: '200% 200%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                  
                  {/* Avatar with initials */}
                  <div className={`h-full w-full rounded-full flex items-center justify-center text-white font-bold text-2xl ${
                    isFoundingMember 
                      ? 'bg-gradient-to-r from-[#BF953F] to-[#FBF5B7] via-[#AA771C]' 
                      : 'bg-gradient-to-r from-[#2196F3] to-[#03A9F4]'
                  }`}>
                    {getInitials()}
                    
                    {/* Level indicator */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] flex items-center justify-center text-white text-xs font-bold">
                        {user.level || 5}
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 10 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="font-bold text-xl text-white">
                    {user.displayName || user.username}
                  </div>
                  <div className="flex items-center text-sm text-white/90 mt-1.5">
                    <div className="font-medium bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center">
                      <motion.div
                        className="mr-1"
                        animate={{ rotate: [0, 5, 0, -5, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <Trophy size={12} className="text-yellow-300" />
                      </motion.div>
                      {user.skillLevel || '3.5 Intermediate+'} 
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Stats section with glass morphism effect */}
          <div className="p-5 backdrop-blur-sm relative">
            {/* XP Progress with animated fill */}
            <motion.div 
              className="relative rounded-xl overflow-hidden mb-5 backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 shadow-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FF5722]/5 to-[#FF9800]/5"></div>
              
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Zap size={16} className="mr-1 text-[#FF5722]" />
                  <div className="font-bold text-gray-800 dark:text-gray-200">XP Level {user.level || 5}</div>
                </div>
                <div className="text-[#FF5722] font-medium text-sm flex items-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? [0, 1] : 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    {user.xp || 520}
                  </motion.span>
                  <span className="text-gray-500 dark:text-gray-400">/1000 XP</span>
                </div>
              </div>
              
              {/* XP Progress Bar with animated fill and glow */}
              <div className="h-3 bg-gray-200/70 dark:bg-gray-700/50 rounded-full overflow-hidden relative">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute h-full w-1 bg-white/50"
                      style={{ left: `${i * 20}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Animated fill */}
                <motion.div 
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ width: '100%' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#FF5722] via-[#FF8C1A] to-[#FFA726]"
                    initial={{ width: '0%' }}
                    animate={{ width: isLoaded ? `${xpPercentage}%` : '0%' }}
                    transition={{ delay: 0.7, duration: 1.5, ease: "easeOut" }}
                  />
                  
                  {/* Moving shine effect */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    animate={{ 
                      left: ['-20%', '120%'],
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      repeatDelay: 1.5
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Stats grid with glass effect and animations */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { 
                  icon: <Zap size={16} />,
                  value: `${user.level || 5}`,
                  label: 'CourtIQ Level',
                  color: 'from-[#FF5722] to-[#FF9800]',
                  delay: 0.6
                },
                { 
                  icon: <BarChart3 size={16} />,
                  value: '1,248',
                  label: 'CourtIQ Rating',
                  color: 'from-[#2196F3] to-[#03A9F4]',
                  delay: 0.7
                },
                { 
                  icon: <TrendingUp size={16} />,
                  value: '7th',
                  label: 'Ranking',
                  color: 'from-[#673AB7] to-[#9C27B0]',
                  delay: 0.8
                }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="relative overflow-hidden rounded-xl backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 shadow-lg p-3 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                  transition={{ delay: stat.delay, duration: 0.5 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    y: -2
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-white/0"></div>
                  
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`}></div>
                  
                  <div className="space-y-1 relative z-10">
                    <div className={`bg-gradient-to-r ${stat.color} text-transparent bg-clip-text font-bold text-xl`}>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoaded ? [0, 1] : 0 }}
                        transition={{ delay: stat.delay + 0.2, duration: 0.8 }}
                      >
                        {stat.value}
                      </motion.span>
                    </div>
                    <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                      <span className={`mr-1 bg-gradient-to-r ${stat.color} p-1 rounded-full text-white`}>{stat.icon}</span>
                      <span>{stat.label}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Additional stats in glass cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { 
                  icon: <Calendar size={16} />,
                  value: user.totalTournaments || 3,
                  label: 'Tournaments',
                  color: 'from-[#4CAF50] to-[#8BC34A]',
                  delay: 0.9
                },
                { 
                  icon: <Award size={16} />,
                  value: user.totalMatches || 24,
                  label: 'Matches',
                  color: 'from-[#FF9800] to-[#FFC107]',
                  delay: 1.0
                }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="relative overflow-hidden rounded-xl backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 shadow-lg p-3 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                  transition={{ delay: stat.delay, duration: 0.5 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    y: -2
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-white/0"></div>
                  
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`}></div>
                  
                  <div className="space-y-1 relative z-10">
                    <div className={`bg-gradient-to-r ${stat.color} text-transparent bg-clip-text font-bold text-xl`}>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoaded ? [0, 1] : 0 }}
                        transition={{ delay: stat.delay + 0.2, duration: 0.8 }}
                      >
                        {stat.value}
                      </motion.span>
                    </div>
                    <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                      <span className={`mr-1 bg-gradient-to-r ${stat.color} p-1 rounded-full text-white`}>{stat.icon}</span>
                      <span>{stat.label}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Tap to view QR hint with animation */}
            <motion.div 
              className="mt-5 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <div className="flex items-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 border border-white/20">
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                  className="mr-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12H16M16 12L12 8M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                <span>Tap passport to view QR code</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Back of passport with QR code */}
        <motion.div 
          className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)',
            backgroundImage: 'radial-gradient(circle at 20% 90%, rgba(33, 150, 243, 0.05) 0%, transparent 60%)'
          }}
        >
          {/* Top border accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2196F3] to-[#03A9F4]"></div>
          
          {/* Left edge glow */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2196F3]/40 to-transparent"></div>
          
          {/* Bottom edge glow */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#03A9F4]/40 to-transparent"></div>
          
          {/* Animated corner accents for founding members */}
          {isFoundingMember && (
            <>
              <div className="absolute top-0 left-0 w-8 h-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute top-0 right-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-8 h-8">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute bottom-0 left-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8">
                <div className="absolute bottom-0 right-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute bottom-0 right-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
            </>
          )}
          
          {/* Header with logo and linear gradient */}
          <div className="relative overflow-hidden">
            {/* Background gradient */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#2196F3] to-[#03A9F4]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #2196F3, #03A9F4),
                  url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
                `
              }}
            ></div>
            
            {/* Content */}
            <div className="p-5 text-white relative z-10">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">Digital Passport</h3>
                <OfficialPicklePlusWhiteLogo className="h-10 w-auto" />
              </div>
              
              <div className="text-sm mt-1 opacity-90 flex items-center">
                <QRCodeSVG 
                  value="scan"
                  size={16}
                  bgColor="transparent"
                  fgColor="white"
                  level="L"
                  className="mr-1 opacity-70"
                />
                Scan to connect or check in at tournaments
              </div>
            </div>
          </div>
          
          {/* QR Code Section */}
          <div className="p-5 flex flex-col items-center backdrop-blur-sm relative">
            <AnimatePresence>
              {isFlipped && (
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {/* QR Code Container with glossy effect */}
                  <motion.div 
                    className="relative bg-white rounded-xl shadow-xl p-5 overflow-hidden"
                    whileHover={{ scale: 1.03 }}
                    style={{
                      background: isFoundingMember
                        ? 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
                        : 'white',
                      boxShadow: isFoundingMember
                        ? '0 10px 30px rgba(255, 215, 0, 0.2), 0 0 10px rgba(255, 215, 0, 0.1)' 
                        : '0 10px 30px rgba(33, 150, 243, 0.2)'
                    }}
                  >
                    {/* Animated radial gradient behind QR code */}
                    <div className={`absolute inset-0 ${isFoundingMember ? 'qr-gold-gradient' : 'qr-blue-gradient'}`}></div>
                    
                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>
                    
                    {/* Border effect for founding members */}
                    {isFoundingMember && (
                      <motion.div 
                        className="absolute inset-0 rounded-xl" 
                        style={{ 
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                          background: 'linear-gradient(45deg, rgba(255,215,0,0.0) 0%, rgba(255,215,0,0.1) 50%, rgba(255,215,0,0) 100%)',
                          backgroundSize: '200% 200%'
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      ></motion.div>
                    )}
                    
                    {/* QR Code */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <QRCodeSVG 
                        value={qrData}
                        size={180}
                        level="H"
                        includeMargin={true}
                        className="mx-auto"
                        imageSettings={{
                          src: "/icon-192.png",
                          x: undefined,
                          y: undefined,
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </motion.div>
                    
                    {/* Animated dots in corners for founding members */}
                    {isFoundingMember && (
                      <>
                        {[...Array(4)].map((_, i) => {
                          const positions = [
                            { top: 10, left: 10 },
                            { top: 10, right: 10 },
                            { bottom: 10, left: 10 },
                            { bottom: 10, right: 10 }
                          ];
                          return (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 rounded-full bg-[#FFD700]"
                              style={positions[i]}
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.5
                              }}
                            />
                          );
                        })}
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* User info with glass card effect */}
            <motion.div 
              className="relative backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 rounded-lg p-3 w-full mt-4 text-center shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 10 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-white/0"></div>
              
              <div className="space-y-1 relative z-10">
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {user.displayName || user.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  <div className="flex items-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <div className="mr-1 w-3 h-3 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
                    Passport ID: {user.passportId || `PID-${user.id}`}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Achievements badges with animations */}
            <motion.div 
              className="w-full grid grid-cols-3 gap-3 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isFlipped ? 1 : 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {[
                { 
                  icon: <Trophy size={16} />, 
                  title: 'Champion', 
                  color: 'from-[#FFD700] to-[#FFC107]', 
                  delay: 0.6
                },
                { 
                  icon: <Award size={16} />, 
                  title: 'Veteran', 
                  color: 'from-[#4CAF50] to-[#8BC34A]', 
                  delay: 0.7
                },
                { 
                  icon: <Star size={16} />, 
                  title: 'All-Star', 
                  color: 'from-[#9C27B0] to-[#673AB7]', 
                  delay: 0.8
                }
              ].map((badge, index) => (
                <motion.div 
                  key={index}
                  className="relative backdrop-blur-sm bg-white/10 dark:bg-white/5 rounded-xl p-3 text-center border border-white/20 shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 10 }}
                  transition={{ delay: badge.delay, duration: 0.5 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-white/0"></div>
                  
                  {/* Icon container with gradient */}
                  <motion.div 
                    className={`bg-gradient-to-r ${badge.color} text-white p-2 rounded-full mx-auto mb-2 w-8 h-8 flex items-center justify-center`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    animate={{ 
                      y: [0, -2, 0],
                      boxShadow: [
                        '0 2px 5px rgba(0, 0, 0, 0.1)',
                        '0 4px 8px rgba(0, 0, 0, 0.12)',
                        '0 2px 5px rgba(0, 0, 0, 0.1)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  >
                    {badge.icon}
                  </motion.div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {badge.title}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Location with glass card effect */}
            <motion.div 
              className="relative backdrop-blur-sm bg-white/10 dark:bg-white/5 rounded-full mt-4 inline-flex items-center px-3 py-2 border border-white/20 shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 10 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-white/0"></div>
              
              <motion.div 
                className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-1 rounded-full mr-2 text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MapPin size={14} />
              </motion.div>
              <span className="text-sm text-gray-700 dark:text-gray-300 relative z-10">
                {user.location || 'Westside Pickleball Club'}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 5px rgba(255, 87, 34, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 87, 34, 0.8); }
          100% { box-shadow: 0 0 5px rgba(255, 87, 34, 0.5); }
        }
        
        .qr-blue-gradient {
          background: radial-gradient(circle at center, rgba(33, 150, 243, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
        }
        
        .qr-gold-gradient {
          background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
        }
      `}</style>
    </div>
  );
}