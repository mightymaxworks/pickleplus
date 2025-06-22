/**
 * PKL-278651-PROF-0017-COMP - Ranking Card
 * 
 * A card displaying user ranking information with PCP tier visualization.
 * Enhanced to emphasize ranking points as the primary metric.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastUpdated 2025-05-16
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
import { Award, ChevronRight, ArrowRight } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { 
  DataCalculationService, 
  PCP_TIER_THRESHOLDS,
  type PCPTier 
} from "@/services/DataCalculationService";

interface RankingCardProps {
  user: EnhancedUser;
  calculationService: DataCalculationService;
  className?: string;
}

// Get color for PCP tiers
function getTierColor(tier: PCPTier): string {
  switch (tier) {
    case "Bronze": return "bg-amber-800";
    case "Silver": return "bg-slate-400";
    case "Gold": return "bg-amber-400";
    case "Platinum": return "bg-cyan-200";
    case "Diamond": return "bg-indigo-300";
    case "Master": return "bg-purple-500";
    default: return "bg-amber-800";
  }
}

// Get text color for PCP tiers
function getTierTextColor(tier: PCPTier): string {
  switch (tier) {
    case "Bronze": return "text-white";
    case "Silver": return "text-slate-900";
    case "Gold": return "text-amber-900";
    case "Platinum": return "text-cyan-900";
    case "Diamond": return "text-indigo-900";
    case "Master": return "text-white";
    default: return "text-white";
  }
}

export default function RankingCard({
  user,
  calculationService,
  className = ""
}: RankingCardProps) {
  // Calculate PCP ranking
  const pcpRanking = DataCalculationService.calculatePCPRanking(user.rankingPoints || 0);
  
  // State for animated progress
  const [progress, setProgress] = useState(0);
  
  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(pcpRanking.progressPercentage);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [pcpRanking.progressPercentage]);
  
  return (
    <Card className={`${className} border-primary/20 shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-2xl font-bold truncate">Ranking Points</CardTitle>
            <CardDescription className="text-sm">Your progress in the Pickle+ community</CardDescription>
          </div>
          <Badge 
            className={`${getTierColor(pcpRanking.tier)} ${getTierTextColor(pcpRanking.tier)} text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5 self-start sm:self-auto flex-shrink-0`}
          >
            {pcpRanking.tier} Tier
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2 sm:pt-4 space-y-3 sm:space-y-5">
        {/* Total PCP Points - Enhanced and highlighted */}
        <div className="bg-primary/10 rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center shadow-inner">
          <span className="text-xs sm:text-sm font-medium text-primary text-center">Total Ranking Points</span>
          <motion.div 
            className="text-2xl sm:text-4xl lg:text-5xl font-bold my-1 sm:my-2 text-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          >
            {pcpRanking.points}
          </motion.div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-center">{pcpRanking.tier} Player</span>
          </div>
        </div>
        
        {/* Next Tier Progress - Enhanced */}
        {pcpRanking.tier !== "Master" && (
          <div className="space-y-2 sm:space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium">Next Tier Progress</span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {pcpRanking.nextTierThreshold - pcpRanking.points} more points to reach {getNextTier(pcpRanking.tier)}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 self-start sm:self-auto">
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <Badge className={`${getTierColor(getNextTier(pcpRanking.tier))} ${getTierTextColor(getNextTier(pcpRanking.tier))} shadow-sm text-xs px-2 py-0.5 flex-shrink-0`}>
                  {getNextTier(pcpRanking.tier)}
                </Badge>
              </div>
            </div>
            
            <Progress value={progress} className="h-2 sm:h-3 bg-muted/80" />
            
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium truncate">{pcpRanking.points}</span>
              <span className="font-bold text-primary text-center px-1">{pcpRanking.progressPercentage}%</span>
              <span className="font-medium truncate">{pcpRanking.nextTierThreshold}</span>
            </div>
          </div>
        )}
        
        {pcpRanking.tier === "Master" && (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg text-center shadow-sm">
            <span className="font-bold text-base sm:text-lg">Congratulations!</span>
            <p className="text-xs sm:text-sm mt-1 leading-tight">You've reached the Master tier, the highest achievement level in Pickle+!</p>
          </div>
        )}
        
        <Separator />
        
        {/* How to Earn Points Section - New */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-semibold text-sm sm:text-md flex items-center gap-1 sm:gap-1.5">
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            How to Earn Ranking Points
          </h3>
          
          <div className="grid grid-cols-1 gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2 bg-muted/30 p-2 rounded-md">
              <div className="bg-primary/15 text-primary rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-xs sm:text-sm">Play Matches</span>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">Each match earns points based on outcome and opponent level.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 bg-muted/30 p-2 rounded-md">
              <div className="bg-primary/15 text-primary rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">2</div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-xs sm:text-sm">Join Tournaments</span>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">Tournament participation earns substantial bonus points.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 bg-muted/30 p-2 rounded-md">
              <div className="bg-primary/15 text-primary rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">3</div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-xs sm:text-sm">Complete Challenges</span>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">Community challenges award bonus ranking points.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get next tier
function getNextTier(currentTier: PCPTier): PCPTier {
  switch (currentTier) {
    case "Bronze": return "Silver";
    case "Silver": return "Gold";
    case "Gold": return "Platinum";
    case "Platinum": return "Diamond";
    case "Diamond": return "Master";
    case "Master": return "Master";
    default: return "Silver";
  }
}