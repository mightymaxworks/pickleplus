/**
 * PKL-278651-PROF-0025-XP - XP Progress Display
 * 
 * This component visualizes the user's XP and level progression
 * with animated progress bars and level-up effects.
 * 
 * Part of Sprint 4 - Engagement & Discovery
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Zap, Info, ArrowRight } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { calculateLevel, getLevelInfo } from "@/lib/calculateLevel";

interface XPProgressDisplayProps {
  user: EnhancedUser;
  className?: string;
  onViewAchievements?: () => void;
}

export default function XPProgressDisplay({
  user,
  className = "",
  onViewAchievements
}: XPProgressDisplayProps) {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp || 0);
  
  // Calculate level information
  const { 
    level, 
    nextLevelXP: xpForNextLevel, 
    currentLevelXP: currentLevelXp, 
    xpProgressPercentage 
  } = getLevelInfo(user.xp || 0);
  
  // XP needed to reach next level
  const xpNeeded = xpForNextLevel - currentLevelXp;
  const xpInCurrentLevel = (user.xp || 0) - currentLevelXp;
  const progressPercentage = Math.max(0, Math.min(100, xpProgressPercentage));
  
  // Check if user has leveled up
  useEffect(() => {
    const currentUserXp = user.xp || 0;
    const currentLevel = calculateLevel(currentUserXp);
    const previousLevel = calculateLevel(prevXp);
    
    // Level up detected
    if (currentLevel > previousLevel) {
      setIsLevelingUp(true);
      setShowConfetti(true);
      
      // Reset after animation
      const timer = setTimeout(() => {
        setIsLevelingUp(false);
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    // Update previous XP reference
    setPrevXp(currentUserXp);
  }, [user.xp, prevXp]);
  
  // Recent XP sources (this would come from the API in a real implementation)
  interface XpActivity {
    source: string;
    amount: number;
    timestamp: string;
  }
  
  const defaultXpSources: XpActivity[] = [
    { source: 'Profile completion', amount: 10, timestamp: new Date().toISOString() },
    { source: 'Match victory', amount: 25, timestamp: new Date().toISOString() },
    { source: 'Daily login', amount: 5, timestamp: new Date().toISOString() }
  ];
  
  const recentXpSources = (user as any).recentXpActivities || defaultXpSources;
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Experience & Level</CardTitle>
          {level >= 10 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Veteran
            </Badge>
          )}
        </div>
        <CardDescription>Track your progress and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {isLevelingUp ? (
            <motion.div
              key="level-up"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1.1, 1.15, 1]
                }}
                transition={{ duration: 1.5, repeat: 1 }}
                className="text-6xl mb-6 text-primary"
              >
                <Sparkles />
              </motion.div>
              
              <motion.h2
                className="text-2xl font-bold mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 3, repeatType: "reverse" }}
              >
                Level Up!
              </motion.h2>
              
              <motion.div
                className="text-4xl font-bold mb-6 text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {level}
              </motion.div>
              
              <motion.p
                className="text-center text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Congratulations! You've reached level {level}.<br />
                New skills and opportunities await.
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="xp-progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-between items-baseline mb-2">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-primary">{level}</span>
                  <ArrowRight className="h-4 w-4 mx-1.5 text-muted-foreground" />
                  <span className="text-lg text-muted-foreground">{level + 1}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">
                    {xpInCurrentLevel}/{xpNeeded} XP
                  </span>
                </div>
              </div>
              
              <div className="relative pt-1">
                <Progress value={progressPercentage} className="h-2" />
                
                {/* Level markers */}
                <div className="w-full flex justify-between items-center mt-1">
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground mt-1">{currentLevelXp} XP</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground mt-1">{xpForNextLevel} XP</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-1 text-primary" />
                  Recent XP Activity
                </h4>
                
                <div className="space-y-2">
                  {recentXpSources.length > 0 ? (
                    recentXpSources.map((activity: XpActivity, index: number) => (
                      <motion.div
                        key={`${activity.source}-${index}`}
                        className="flex justify-between items-center p-1.5 rounded hover:bg-muted/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="text-sm">{activity.source}</span>
                        <Badge variant="outline" className="text-primary">
                          +{activity.amount} XP
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                      <Info className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm">No recent XP activity</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  Total: <span className="font-semibold">{user.xp || 0} XP</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      
      {onViewAchievements && (
        <CardFooter className="px-6 py-3 border-t flex justify-between">
          <div className="text-xs text-muted-foreground">
            Earn XP by completing profile, playing matches, and more!
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={onViewAchievements}
          >
            <Trophy className="h-3 w-3 mr-1" />
            View Achievements
          </Button>
        </CardFooter>
      )}
      
      {/* Confetti effect on level up */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 25 }).map((_, index) => {
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 2 + 1;
            const delay = Math.random() * 0.5;
            
            return (
              <motion.div
                key={index}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${left}%`,
                  top: '-20px',
                  width: size,
                  height: size,
                  backgroundColor: [
                    '#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FFC107'
                  ][Math.floor(Math.random() * 5)]
                }}
                initial={{ y: -20, opacity: 1 }}
                animate={{ 
                  y: ['0%', '100%'], 
                  x: [`${left}%`, `${left + (Math.random() * 30 - 15)}%`],
                  opacity: [1, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: animationDuration,
                  delay: delay,
                  ease: 'easeOut'
                }}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}