import React from "react";
import { Badge } from "@/components/ui/badge";
import { TierProgressBar } from "@/components/TierProgressBar";
import { Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface TierBadgeProps {
  tier: string;
  tierDescription: string;
  tierProgress: number;
  nextTier: string | null;
  levelUntilNextTier: number;
  showDetails?: boolean;
}

export function TierBadge({ 
  tier, 
  tierDescription, 
  tierProgress, 
  nextTier, 
  levelUntilNextTier,
  showDetails = false
}: TierBadgeProps) {
  // Generate the correct background color class based on the tier name
  const getTierColorClasses = () => {
    switch (tier) {
      case "Dink Dabbler":
        return "bg-gradient-to-r from-green-200 to-green-400 text-green-800";
      case "Paddle Apprentice":
        return "bg-gradient-to-r from-teal-200 to-teal-400 text-teal-800";
      case "Rally Regular":
        return "bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800";
      case "Kitchen Commander":
        return "bg-gradient-to-r from-purple-200 to-purple-400 text-purple-800";
      case "Serve Specialist":
        return "bg-gradient-to-r from-orange-200 to-orange-400 text-orange-800";
      case "Volley Virtuoso":
        return "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800";
      case "Pickleball Pro":
        return "bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Simple badge display if details aren't needed
  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className={`${getTierColorClasses()} text-xs px-2 py-1 font-semibold`}>
              {tier}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tierDescription}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 mb-6 pickle-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold font-product-sans">XP Tier</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Earn XP by completing activities like matches, tournaments, and profile updates to progress through tiers.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Current tier badge */}
      <div className="mb-4">
        <Badge className={`${getTierColorClasses()} text-sm px-3 py-1.5 mb-2 font-semibold`}>
          {tier}
        </Badge>
        <p className="text-sm text-gray-600 mt-1">{tierDescription}</p>
      </div>
      
      {/* Improved tier progress visualization */}
      <TierProgressBar
        currentTier={tier}
        tierProgress={tierProgress}
        nextTier={nextTier}
      />
      
      {nextTier && (
        <p className="text-sm text-gray-500 mt-2">
          {levelUntilNextTier} more {levelUntilNextTier === 1 ? 'level' : 'levels'} until <span className="font-medium">{nextTier}</span>
        </p>
      )}
    </div>
  );
}