/**
 * PKL-278651-PROF-0016-COMP - Performance Metrics Card
 * 
 * A card displaying key performance metrics with animated counters.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp, TrendingDown, Trophy, Flag } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";

interface PerformanceMetricsCardProps {
  user: EnhancedUser;
  className?: string;
}

export default function PerformanceMetricsCard({
  user,
  className = ""
}: PerformanceMetricsCardProps) {
  // Animate controls for counters
  const controls = useAnimation();
  
  // Counter state
  const [counters, setCounters] = useState({
    matches: 0,
    wins: 0,
    winRate: 0,
    tournaments: 0
  });
  
  // Calculate real values
  const totalMatches = user.totalMatches || 0;
  const matchesWon = user.matchesWon || 0;
  const matchesLost = totalMatches - matchesWon;
  const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
  const tournaments = user.totalTournaments || 0;
  
  // Animate counters on mount
  useEffect(() => {
    // Start animation
    controls.start({ opacity: 1, y: 0 });
    
    // Animate counters
    const duration = 1500; // ms
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setCounters({
        matches: Math.round(totalMatches * eased),
        wins: Math.round(matchesWon * eased),
        winRate: Math.round(winRate * eased),
        tournaments: Math.round(tournaments * eased)
      });
      
      if (progress === 1) {
        clearInterval(interval);
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, [totalMatches, matchesWon, winRate, tournaments, controls]);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Your statistical performance summary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Matches */}
          <motion.div
            className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.3, delay: 0 }}
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Flag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
              <div className="text-2xl font-bold">{counters.matches}</div>
            </div>
          </motion.div>
          
          {/* Matches Won */}
          <motion.div
            className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Matches Won</div>
              <div className="text-2xl font-bold">{counters.wins}</div>
            </div>
          </motion.div>
          
          {/* Win Rate */}
          <motion.div
            className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="bg-primary/10 p-3 rounded-full">
              {winRate >= 50 ? (
                <TrendingUp className="h-5 w-5 text-primary" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="text-2xl font-bold">{counters.winRate}%</div>
            </div>
          </motion.div>
          
          {/* Tournaments */}
          <motion.div
            className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tournaments</div>
              <div className="text-2xl font-bold">{counters.tournaments}</div>
            </div>
          </motion.div>
        </div>
        
        {/* Match Summary */}
        <motion.div 
          className="mt-6 p-4 rounded-lg bg-muted/50"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="text-sm font-medium mb-3">Match Win/Loss Summary</h3>
          <div className="flex items-center">
            <div className="h-3 rounded-l-full bg-primary" style={{ width: `${winRate}%` }} />
            <div className="h-3 rounded-r-full bg-destructive/30" style={{ width: `${100 - winRate}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <div>{matchesWon} Wins</div>
            <div>{matchesLost} Losses</div>
          </div>
        </motion.div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <span>View Complete Stats</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}