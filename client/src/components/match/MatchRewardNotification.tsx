import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  TrendingUp,
  ArrowUpRight,
  Trophy,
  Clock,
  Shield,
  Users,
  BarChart3,
  Flame,
  Award
} from "lucide-react";

interface MatchRewardNotificationProps {
  username: string;
  isWinner: boolean;
  xp: {
    amount: number;
    breakdown: {
      baseAmount: number;
      dailyMatchNumber: number;
      cooldownReduction: boolean;
      cooldownAmount: number | null;
      tournamentMultiplier: number | null;
      victoryBonus: number | null;
      winStreakBonus: number | null;
      closeMatchBonus: number | null;
      skillBonus: number | null;
      foundingMemberBonus: number | null;
      weeklyCapReached: boolean;
    };
  };
  ranking: {
    points: number;
    previousTier: string;
    newTier: string;
    tierChanged: boolean;
  };
}

export default function MatchRewardNotification({
  username,
  isWinner,
  xp,
  ranking,
}: MatchRewardNotificationProps) {
  // Get modifiers that were applied
  const hasModifier = (value: number | null) => value !== null && value > 0;
  
  // Calculate total bonuses
  const totalBonus = [
    xp.breakdown.tournamentMultiplier,
    xp.breakdown.victoryBonus,
    xp.breakdown.winStreakBonus,
    xp.breakdown.closeMatchBonus,
    xp.breakdown.skillBonus,
    xp.breakdown.foundingMemberBonus
  ].filter(Boolean).reduce((sum, val) => sum + (val || 0), 0);

  return (
    <Card className={`border-l-4 ${isWinner ? "border-l-green-500" : "border-l-blue-500"}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {username}
          </CardTitle>
          <Badge variant={isWinner ? "default" : "outline"} className={isWinner ? "bg-green-500 hover:bg-green-600" : ""}>
            {isWinner ? "Winner" : "Participant"}
          </Badge>
        </div>
        <CardDescription>
          Match Rewards
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* XP Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Experience Points</span>
            </div>
            <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">+{xp.amount}</span>
          </div>
          
          <div className="space-y-3 bg-muted/30 p-3 rounded-md text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Base XP (Match #{xp.breakdown.dailyMatchNumber})</span>
              <span className="font-medium">+{xp.breakdown.baseAmount}</span>
            </div>
            
            {xp.breakdown.cooldownReduction && (
              <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Cooldown Penalty
                </span>
                <span className="font-medium">-{xp.breakdown.cooldownAmount}</span>
              </div>
            )}
            
            {hasModifier(xp.breakdown.tournamentMultiplier) && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" />
                  Tournament Bonus
                </span>
                <span className="font-medium">+{xp.breakdown.tournamentMultiplier}</span>
              </div>
            )}
            
            {hasModifier(xp.breakdown.victoryBonus) && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Victory Bonus
                </span>
                <span className="font-medium">+{xp.breakdown.victoryBonus}</span>
              </div>
            )}
            
            {hasModifier(xp.breakdown.winStreakBonus) && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" />
                  Win Streak Bonus
                </span>
                <span className="font-medium">+{xp.breakdown.winStreakBonus}</span>
              </div>
            )}
            
            {hasModifier(xp.breakdown.closeMatchBonus) && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Close Match Bonus
                </span>
                <span className="font-medium">+{xp.breakdown.closeMatchBonus}</span>
              </div>
            )}
            
            {hasModifier(xp.breakdown.skillBonus) && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Skill Difference Bonus
                </span>
                <span className="font-medium">+{xp.breakdown.skillBonus}</span>
              </div>
            )}
            
            {hasModifier(xp.breakdown.foundingMemberBonus) && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  Founding Member Bonus
                </span>
                <span className="font-medium">+{xp.breakdown.foundingMemberBonus}</span>
              </div>
            )}
            
            {xp.breakdown.weeklyCapReached && (
              <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  Weekly XP Cap Reached
                </span>
                <span className="font-medium">Reduced</span>
              </div>
            )}
            
            {totalBonus > 0 && (
              <>
                <Separator />
                <div className="flex justify-between items-center font-medium">
                  <span>Total Bonus XP</span>
                  <span className="text-emerald-600 dark:text-emerald-400">+{totalBonus}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Ranking Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Ranking Points</span>
            </div>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">+{ranking.points}</span>
          </div>
          
          <div className="relative pt-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-between items-center">
              <div className="bg-card px-2 text-xs text-muted-foreground">
                {ranking.previousTier} Tier
              </div>
              {ranking.tierChanged && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 text-xs rounded-full flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Tier Up!
                </div>
              )}
              <div className="bg-card px-2 text-xs font-medium">
                {ranking.newTier} Tier
              </div>
            </div>
          </div>
          
          <Progress value={ranking.tierChanged ? 100 : 65} className="h-2 bg-blue-100 dark:bg-blue-900/20" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="w-full text-center text-xs text-muted-foreground">
          Points calculation by CourtIQ™ Rating System
        </div>
      </CardFooter>
    </Card>
  );
}