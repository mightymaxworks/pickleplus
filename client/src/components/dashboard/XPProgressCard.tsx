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
import { useDerivedData } from "@/contexts/DerivedDataContext";
import { useAuth } from "@/lib/auth";
import { Zap, ChevronRight } from "lucide-react";

export default function XPProgressCard() {
  const { user } = useAuth();
  const { calculatedMetrics } = useDerivedData();
  
  // Calculate remaining XP to next level
  const remainingXP = useMemo(() => {
    if (!calculatedMetrics) return 0;
    return calculatedMetrics.nextLevelXP - (user?.xp || 0);
  }, [calculatedMetrics, user?.xp]);
  
  // Show loading skeleton if data is not available
  if (!calculatedMetrics || !user) {
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
            <h3 className="text-lg font-semibold">Level {calculatedMetrics.level}</h3>
            <p className="text-sm text-muted-foreground">
              {remainingXP} XP needed for Level {calculatedMetrics.level + 1}
            </p>
          </div>
        </div>
        
        <Progress
          value={calculatedMetrics.xpProgressPercentage}
          className="h-2 mb-2"
        />
        
        <div className="flex justify-between text-sm">
          <span>{user.xp} XP</span>
          <div className="flex items-center">
            <span>{calculatedMetrics.nextLevelXP} XP</span>
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
              {user.totalMatches ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}