/**
 * PKL-278651-PROF-0017-COMP - Ranking Card
 * 
 * A card displaying user ranking information with PCP tier visualization.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
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
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pickle Community Points</CardTitle>
        <CardDescription>PCP Ranking & Progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tier Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Current Tier:</span>
          </div>
          <Badge 
            className={`${getTierColor(pcpRanking.tier)} ${getTierTextColor(pcpRanking.tier)} text-sm font-bold px-3 py-1`}
          >
            {pcpRanking.tier}
          </Badge>
        </div>
        
        {/* PCP Points */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total PCP Points:</span>
          <motion.span 
            className="text-lg font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {pcpRanking.points}
          </motion.span>
        </div>
        
        {/* Next Tier Progress */}
        {pcpRanking.tier !== "Master" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Next Tier:</span>
              <div className="flex items-center gap-2">
                <Badge className={`${getTierColor(pcpRanking.tier)} ${getTierTextColor(pcpRanking.tier)} opacity-70`}>
                  {pcpRanking.tier}
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge className={`${getTierColor(getNextTier(pcpRanking.tier))} ${getTierTextColor(getNextTier(pcpRanking.tier))}`}>
                  {getNextTier(pcpRanking.tier)}
                </Badge>
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{pcpRanking.points} / {pcpRanking.nextTierThreshold}</span>
              <span>{pcpRanking.progressPercentage}% Complete</span>
            </div>
          </div>
        )}
        
        {pcpRanking.tier === "Master" && (
          <div className="p-3 bg-muted/50 rounded-md text-center text-sm">
            <span className="font-semibold">Congratulations!</span>
            <span className="text-muted-foreground"> You've reached the highest tier.</span>
          </div>
        )}
        
        <Separator />
        
        {/* Rating Contribution */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CourtIQ™ Rating Contribution:</span>
            <span className="text-sm font-bold">
              +{pcpRanking.ratingContribution} points
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {pcpRanking.ratingContribution >= 500 ? (
              "Maximum rating bonus achieved!"
            ) : (
              `${500 - pcpRanking.ratingContribution} more PCP points until maximum rating contribution.`
            )}
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