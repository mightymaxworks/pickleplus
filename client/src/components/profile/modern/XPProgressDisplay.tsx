/**
 * PKL-278651-PROF-0020-COMP - XP Progress Display
 * 
 * An animated component showing user XP progress and level information.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Award, Star } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { getLevelInfo } from "@/lib/calculateLevel";

interface XPProgressDisplayProps {
  user: EnhancedUser;
  className?: string;
}

export default function XPProgressDisplay({
  user,
  className = ""
}: XPProgressDisplayProps) {
  // Get level info from XP
  const { level, nextLevelXP, xpProgressPercentage } = getLevelInfo(user.xp);
  
  // State for animated progress
  const [progress, setProgress] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);
  const [levelChanged, setLevelChanged] = useState(false);
  
  // Check if displayed level is different from user level
  useEffect(() => {
    if (level !== user.level) {
      setLevelChanged(true);
      
      // Reset after animation completes
      const timer = setTimeout(() => {
        setLevelChanged(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [level, user.level]);
  
  // Animate XP and progress on mount
  useEffect(() => {
    // Start from 0 for better animation
    setProgress(0);
    setCurrentXP(0);
    
    // Animate progress over time
    const progressDuration = 1500; // ms
    const progressStartTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - progressStartTime;
      const progressValue = Math.min(elapsed / progressDuration, 1);
      
      // Easing function for smoother animation
      const eased = 1 - Math.pow(1 - progressValue, 3);
      
      setProgress(xpProgressPercentage * eased);
      setCurrentXP(Math.round(user.xp * eased));
      
      if (progressValue === 1) {
        clearInterval(progressInterval);
      }
    }, 16);
    
    return () => clearInterval(progressInterval);
  }, [user.xp, xpProgressPercentage]);
  
  // Calculate XP needed for next level
  const xpForNextLevel = nextLevelXP - user.xp;
  
  return (
    <Card className={className}>
      <CardHeader className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 pointer-events-none" />
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <CardTitle>Experience Level</CardTitle>
            <CardDescription>Your progress and achievements</CardDescription>
          </div>
          
          {/* Level Badge */}
          <div className="relative">
            <div className="bg-background border-4 border-primary rounded-full h-16 w-16 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`level-${level}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-2xl font-bold"
                >
                  {level}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Level Up Indicator */}
            {levelChanged && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-1 rounded"
              >
                +1
              </motion.div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium">XP Progress</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`xp-${currentXP}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold"
              >
                {currentXP} XP
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="relative pt-1">
            <Progress value={progress} className="h-2.5" />
            
            {/* XP Markers */}
            {progress > 0 && (
              <div className="absolute top-0 left-0 w-full flex justify-between px-1 text-xs -mt-1 pointer-events-none">
                <div className="text-muted-foreground">{user.xp - (user.xp % 100)}</div>
                <div className="text-muted-foreground">{nextLevelXP}</div>
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground text-center">
            {xpForNextLevel} XP needed for Level {level + 1}
          </div>
        </div>
        
        {/* Rewards and Achievements */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-medium">Unlocked Rewards</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {level >= 2 && (
              <Badge variant="outline" className="bg-background">
                Skill Assessments
              </Badge>
            )}
            {level >= 3 && (
              <Badge variant="outline" className="bg-background">
                Advanced Analytics
              </Badge>
            )}
            {level >= 5 && (
              <Badge variant="outline" className="bg-background">
                Custom Training Plans
              </Badge>
            )}
            {level >= 10 && (
              <Badge variant="outline" className="bg-background">
                Coach Mode
              </Badge>
            )}
            {level < 2 && (
              <div className="w-full text-center text-sm text-muted-foreground">
                Reach Level 2 to unlock rewards!
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <span>View XP History</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}