/**
 * Enhanced Mobile Player Passport - PKL-278651 Mobile-First Design
 * Revolutionary swipeable card interface with gesture navigation and micro-animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, PanInfo } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Star, 
  Users, 
  TrendingUp, 
  Award, 
  MapPin, 
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight,
  Share2,
  QrCode,
  Settings,
  Plus,
  Crown,
  Medal,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EnhancedMobilePassportProps {
  onQuickAction?: (action: string) => void;
  onShareAchievement?: (achievement: any) => void;
}

interface PassportCard {
  id: string;
  title: string;
  type: 'overview' | 'stats' | 'achievements' | 'progress';
  icon: React.ReactNode;
  gradient: string;
  data?: any;
}

export default function EnhancedMobilePassport({ 
  onQuickAction, 
  onShareAchievement 
}: EnhancedMobilePassportProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentCard, setCurrentCard] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Animated values for smooth interactions
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  // Fetch user data
  const { data: userStats } = useQuery({
    queryKey: ['/api/user/enhanced-stats'],
    queryFn: async () => ({
      totalMatches: 47,
      winRate: 68,
      currentStreak: 5,
      rankingPoints: 1247,
      level: 12,
      xp: 2847,
      nextLevelXp: 3000,
      achievements: [
        { id: 1, name: 'First Win', icon: '🏆', unlocked: true, rarity: 'common' },
        { id: 2, name: 'Win Streak 5', icon: '🔥', unlocked: true, rarity: 'rare' },
        { id: 3, name: 'Tournament Pro', icon: '👑', unlocked: false, rarity: 'legendary' }
      ]
    })
  });

  // Define passport cards with enhanced mobile design
  const passportCards: PassportCard[] = [
    {
      id: 'overview',
      title: 'Player Overview',
      type: 'overview',
      icon: <Trophy className="w-6 h-6" />,
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      data: {
        name: user?.displayName || user?.username || 'Player',
        rating: user?.skill_level || 3.5,
        passportCode: user?.passportCode || 'LOADING...',
        level: userStats?.level || 1,
        location: 'San Francisco, CA'
      }
    },
    {
      id: 'stats',
      title: 'Performance Stats',
      type: 'stats',
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-blue-400 via-purple-500 to-indigo-600',
      data: {
        matches: userStats?.totalMatches || 0,
        winRate: userStats?.winRate || 0,
        streak: userStats?.currentStreak || 0,
        points: userStats?.rankingPoints || 0
      }
    },
    {
      id: 'achievements',
      title: 'Achievements',
      type: 'achievements',
      icon: <Award className="w-6 h-6" />,
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      data: {
        achievements: userStats?.achievements || [],
        totalUnlocked: userStats?.achievements?.filter((a: any) => a.unlocked).length || 0,
        recentUnlock: userStats?.achievements?.find((a: any) => a.unlocked) || null
      }
    },
    {
      id: 'progress',
      title: 'Progress Tracking',
      type: 'progress',
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      data: {
        xp: userStats?.xp || 0,
        nextLevelXp: userStats?.nextLevelXp || 1000,
        level: userStats?.level || 1,
        progressPercent: ((userStats?.xp || 0) / (userStats?.nextLevelXp || 1000)) * 100
      }
    }
  ];

  // Handle card swipe
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.x > threshold && currentCard > 0) {
      // Swipe right - previous card
      setCurrentCard(currentCard - 1);
      x.set(0);
    } else if (info.offset.x < -threshold && currentCard < passportCards.length - 1) {
      // Swipe left - next card
      setCurrentCard(currentCard + 1);
      x.set(0);
    } else {
      // Snap back to center
      x.set(0);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    onQuickAction?.(action);
    
    // Show feedback
    const actionMessages = {
      'record-match': 'Opening match recorder...',
      'find-coach': 'Finding coaches near you...',
      'view-achievements': 'Loading achievements...',
      'share-profile': 'Preparing profile for sharing...'
    };
    
    toast({
      title: "Action Started",
      description: actionMessages[action as keyof typeof actionMessages] || 'Processing...',
    });
  };

  // Render individual card content
  const renderCardContent = (card: PassportCard) => {
    switch (card.type) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* User Avatar and Basic Info */}
            <div className="text-center space-y-3">
              <div className="relative mx-auto">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-2xl font-bold text-white">
                  {card.data.name.substring(0, 2).toUpperCase()}
                </div>
                <motion.div 
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <Crown className="w-4 h-4 text-yellow-800" />
                </motion.div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white">{card.data.name}</h2>
                <p className="text-white/80 text-sm">Level {card.data.level} Player</p>
              </div>
            </div>

            {/* Rating and Passport Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-white/70 text-xs uppercase tracking-wide">DUPR Rating</div>
                <div className="text-2xl font-bold text-white">{card.data.rating}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-white/70 text-xs uppercase tracking-wide">Passport Code</div>
                <div className="text-lg font-mono font-bold text-white">{card.data.passportCode}</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-center text-white/80 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              {card.data.location}
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Performance Overview</h3>
              <p className="text-white/80 text-sm">Your competitive journey</p>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{card.data.matches}</div>
                <div className="text-white/70 text-xs">Total Matches</div>
              </motion.div>

              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{card.data.winRate}%</div>
                <div className="text-white/70 text-xs">Win Rate</div>
              </motion.div>

              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{card.data.streak}</div>
                <div className="text-white/70 text-xs">Win Streak</div>
              </motion.div>

              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{card.data.points}</div>
                <div className="text-white/70 text-xs">Ranking Points</div>
              </motion.div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Achievements</h3>
              <p className="text-white/80 text-sm">{card.data.totalUnlocked} unlocked</p>
            </div>

            {/* Achievement List */}
            <div className="space-y-3">
              {card.data.achievements?.map((achievement: any, index: number) => (
                <motion.div
                  key={achievement.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg backdrop-blur-sm",
                    achievement.unlocked 
                      ? "bg-white/15 border border-yellow-400/30" 
                      : "bg-white/5 border border-white/10"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => achievement.unlocked && onShareAchievement?.(achievement)}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-medium",
                      achievement.unlocked ? "text-white" : "text-white/50"
                    )}>
                      {achievement.name}
                    </h4>
                    <Badge 
                      variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Trophy className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Level Progress</h3>
              <p className="text-white/80 text-sm">Level {card.data.level} • {card.data.nextLevelXp - card.data.xp} XP to next level</p>
            </div>

            {/* XP Progress Ring */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/20"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-white"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: card.data.progressPercent / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                      strokeDasharray: "251.2",
                      strokeDashoffset: `${251.2 * (1 - card.data.progressPercent / 100)}`
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{card.data.level}</div>
                    <div className="text-white/70 text-xs">LEVEL</div>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">Experience Points</span>
                <span className="text-white font-medium">{card.data.xp} / {card.data.nextLevelXp}</span>
              </div>
              <Progress 
                value={card.data.progressPercent} 
                className="h-2"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Card Container */}
      <div className="relative h-[500px] mb-6" ref={constraintsRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            whileTap={{ cursor: "grabbing" }}
          >
            <Card className={cn(
              "w-full h-full border-0 overflow-hidden",
              "bg-gradient-to-br",
              passportCards[currentCard].gradient
            )}>
              <CardContent className="p-6 h-full flex flex-col">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {passportCards[currentCard].icon}
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                      {passportCards[currentCard].title}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-1">
                    {passportCards.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          index === currentCard ? "bg-white" : "bg-white/30"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1">
                  {renderCardContent(passportCards[currentCard])}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => currentCard > 0 && setCurrentCard(currentCard - 1)}
          disabled={currentCard === 0}
          className="w-10 h-10 rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => currentCard < passportCards.length - 1 && setCurrentCard(currentCard + 1)}
          disabled={currentCard === passportCards.length - 1}
          className="w-10 h-10 rounded-full"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => handleQuickAction('record-match')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Match
          </Button>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => handleQuickAction('find-coach')}
            variant="outline" 
            className="w-full"
            size="lg"
          >
            <Users className="w-4 h-4 mr-2" />
            Find Coach
          </Button>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => handleQuickAction('view-achievements')}
            variant="outline" 
            className="w-full"
            size="lg"
          >
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </Button>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => handleQuickAction('share-profile')}
            variant="outline" 
            className="w-full"
            size="lg"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </motion.div>
      </div>
    </div>
  );
}