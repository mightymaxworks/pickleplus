import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PCPRankingInfo } from "@/services/DataCalculationService";
import { Trophy, Award, ChevronUp } from "lucide-react";

interface PCPRankingCardProps {
  rankingInfo: PCPRankingInfo;
  className?: string;
}

// Colors for the different tiers
const TIER_COLORS = {
  Bronze: "bg-amber-700",
  Silver: "bg-slate-300",
  Gold: "bg-amber-400",
  Platinum: "bg-cyan-300",
  Diamond: "bg-indigo-500",
  Master: "bg-purple-600"
};

// Icons for the different tiers
const TIER_ICONS = {
  Bronze: <Trophy className="h-5 w-5 mr-1" />,
  Silver: <Trophy className="h-5 w-5 mr-1" />,
  Gold: <Trophy className="h-5 w-5 mr-1" />,
  Platinum: <Award className="h-5 w-5 mr-1" />,
  Diamond: <Award className="h-5 w-5 mr-1" />,
  Master: <Award className="h-5 w-5 mr-1" />
};

export const PCPRankingCard: React.FC<PCPRankingCardProps> = ({
  rankingInfo,
  className = ""
}) => {
  const { tier, points, nextTierThreshold, progressPercentage, ratingContribution } = rankingInfo;
  
  const isMasterTier = tier === "Master";
  const tierColor = TIER_COLORS[tier] || "bg-gray-500";
  const tierIcon = TIER_ICONS[tier] || <Trophy className="h-5 w-5 mr-1" />;
  
  return (
    <Card className={`shadow-md overflow-hidden ${className}`}>
      <CardHeader className={`${tierColor} text-white py-4`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            {tierIcon} {tier} Tier
          </CardTitle>
          <Badge variant="outline" className="text-white border-white font-semibold">
            {points.toLocaleString()} PCP
          </Badge>
        </div>
        <CardDescription className="text-white/90">
          Pickle Community Points
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        {!isMasterTier ? (
          <>
            <div className="flex justify-between mb-1 text-sm">
              <span>Progress to {getNextTier(tier)}</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 mb-4" 
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{points.toLocaleString()}</span>
              <span>{nextTierThreshold.toLocaleString()}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1 italic text-center">
              Need {(nextTierThreshold - points).toLocaleString()} more points
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <span className="font-semibold">Maximum Tier Achieved!</span>
            <div className="text-sm text-muted-foreground mt-1">
              Congratulations on reaching Master Tier
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rating Contribution</span>
            <div className="flex items-center">
              <ChevronUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="font-semibold">
                {ratingContribution} / 500
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {ratingContribution >= 500 ? 
              "Maximum contribution to overall rating" : 
              `${500 - ratingContribution} more points for maximum rating boost`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get the next tier name
function getNextTier(currentTier: string): string {
  switch (currentTier) {
    case "Bronze": return "Silver";
    case "Silver": return "Gold";
    case "Gold": return "Platinum";
    case "Platinum": return "Diamond";
    case "Diamond": return "Master";
    default: return "Master";
  }
}

export default PCPRankingCard;