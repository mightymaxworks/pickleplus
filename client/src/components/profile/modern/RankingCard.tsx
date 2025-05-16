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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Ranking Points</CardTitle>
            <CardDescription>Your progress in the Pickle+ community</CardDescription>
          </div>
          <Badge 
            className={`${getTierColor(pcpRanking.tier)} ${getTierTextColor(pcpRanking.tier)} text-sm font-bold px-3 py-1.5 ml-2`}
          >
            {pcpRanking.tier} Tier
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {/* Total PCP Points - Enhanced and highlighted */}
        <div className="bg-primary/10 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
          <span className="text-sm font-medium text-primary">Total Ranking Points</span>
          <motion.div 
            className="text-4xl sm:text-5xl font-bold my-2 text-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          >
            {pcpRanking.points}
          </motion.div>
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{pcpRanking.tier} Player</span>
          </div>
        </div>
        
        {/* Next Tier Progress - Enhanced */}
        {pcpRanking.tier !== "Master" && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Next Tier Progress</span>
                <span className="text-xs text-muted-foreground">
                  {pcpRanking.nextTierThreshold - pcpRanking.points} more points to reach {getNextTier(pcpRanking.tier)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <Badge className={`${getTierColor(getNextTier(pcpRanking.tier))} ${getTierTextColor(getNextTier(pcpRanking.tier))} shadow-sm`}>
                  {getNextTier(pcpRanking.tier)}
                </Badge>
              </div>
            </div>
            
            <Progress value={progress} className="h-3 bg-muted/80" />
            
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{pcpRanking.points} points</span>
              <span className="font-bold text-primary">{pcpRanking.progressPercentage}% Complete</span>
              <span className="font-medium">{pcpRanking.nextTierThreshold} points</span>
            </div>
          </div>
        )}
        
        {pcpRanking.tier === "Master" && (
          <div className="p-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg text-center shadow-sm">
            <span className="font-bold text-lg">Congratulations!</span>
            <p className="text-sm mt-1">You've reached the Master tier, the highest achievement level in Pickle+!</p>
          </div>
        )}
        
        <Separator />
        
        {/* How to Earn Points Section - New */}
        <div className="space-y-3">
          <h3 className="font-semibold text-md flex items-center gap-1.5">
            <Award className="h-4 w-4 text-primary" />
            How to Earn Ranking Points
          </h3>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-start gap-2 bg-muted/30 p-2 rounded-md">
              <div className="bg-primary/15 text-primary rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <span className="font-medium">Play Matches</span>
                <p className="text-xs text-muted-foreground">Each match you play earns you ranking points based on the outcome and opponent level.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 bg-muted/30 p-2 rounded-md">
              <div className="bg-primary/15 text-primary rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <span className="font-medium">Join Tournaments</span>
                <p className="text-xs text-muted-foreground">Tournament participation and performance earns substantial bonus points.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 bg-muted/30 p-2 rounded-md">
              <div className="bg-primary/15 text-primary rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <span className="font-medium">Complete Challenges</span>
                <p className="text-xs text-muted-foreground">Community challenges and skill activities award bonus ranking points.</p>
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