/**
 * PKL-278651-PROF-0011-COMP - XP Progress Card Component
 * 
 * This component displays user XP progress and level information 
 * with frontend-first calculations.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// EMERGENCY FIX: Removed import for useDerivedData to prevent infinite loops
import { useAuth } from "@/lib/auth";
import { Zap, ChevronRight } from "lucide-react";

export default function XPProgressCard() {
  const { user } = useAuth();
  
  // EMERGENCY FIX: Direct calculation instead of using DerivedDataContext
  // to prevent infinite render loops
  const nextLevelXpMap = {
    1: 100,
    2: 250,
    3: 500,
    4: 750,
    5: 800,
    6: 850,
    7: 900,
    8: 950,
    9: 1000
  };
  
  // Calculate level directly
  const level = useMemo(() => {
    if (!user?.xp) return 1;
    const xp = user.xp;
    
    if (xp >= 1000) return 10;
    if (xp >= 950) return 9;
    if (xp >= 900) return 8;
    if (xp >= 850) return 7;
    if (xp >= 800) return 6;
    if (xp >= 750) return 5;
    if (xp >= 500) return 4;
    if (xp >= 250) return 3;
    if (xp >= 100) return 2;
    return 1;
  }, [user?.xp]);
  
  // Get next level XP threshold
  const nextLevelXP = useMemo(() => {
    return nextLevelXpMap[level as keyof typeof nextLevelXpMap] || 1000;
  }, [level]);
  
  // Calculate XP progress percentage
  const xpProgressPercentage = useMemo(() => {
    if (!user?.xp) return 0;
    
    const currentLevelXP = level > 1 ? 
      nextLevelXpMap[(level - 1) as keyof typeof nextLevelXpMap] :
      0;
    
    const xpInCurrentLevel = user.xp - currentLevelXP;
    const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
    
    return Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100));
  }, [user?.xp, level, nextLevelXP]);
  
  // Calculate remaining XP to next level
  const remainingXP = useMemo(() => {
    if (!user?.xp) return nextLevelXP;
    return nextLevelXP - user.xp;
  }, [nextLevelXP, user?.xp]);
  
  // Show loading skeleton if data is not available
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-2 w-full bg-muted animate-pulse rounded mb-2" />
          <div className="flex justify-between">
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Level {level}</h3>
            <p className="text-sm text-muted-foreground">
              {remainingXP} XP needed for Level {level + 1}
            </p>
          </div>
        </div>
        
        <Progress
          value={xpProgressPercentage}
          className="h-2 mb-2"
        />
        
        <div className="flex justify-between text-sm">
          <span>{user.xp || 0} XP</span>
          <div className="flex items-center">
            <span>{nextLevelXP} XP</span>
            <ChevronRight className="h-4 w-4 ml-1 text-muted-foreground" />
          </div>
        </div>
        
        {/* Mobile only: Visible at xs and sm breakpoints */}
        <div className="flex justify-between mt-4 md:hidden">
          <div className="text-center">
            <div className="text-lg font-semibold">{user.totalMatches || 0}</div>
            <div className="text-xs text-muted-foreground">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{user.matchesWon || 0}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {user.totalMatches && user.matchesWon ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}