import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface TierInfo {
  tier: string;
  color: string;
  description: string;
  levels: string;
}

// The complete tier list with their respective colors and levels
const allTiers: TierInfo[] = [
  { 
    tier: "Dink Dabbler", 
    color: "bg-gradient-to-r from-green-200 to-green-400 text-green-800",
    description: "Just starting out, learning the basics of pickleball.",
    levels: "1-15"
  },
  { 
    tier: "Paddle Apprentice", 
    color: "bg-gradient-to-r from-teal-200 to-teal-400 text-teal-800",
    description: "Building fundamental skills and knowledge of the game.",
    levels: "16-30"
  },
  { 
    tier: "Rally Regular", 
    color: "bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800",
    description: "Confidently playing regular games and improving consistency.",
    levels: "31-45"
  },
  { 
    tier: "Kitchen Commander", 
    color: "bg-gradient-to-r from-purple-200 to-purple-400 text-purple-800",
    description: "Mastering the non-volley zone and strategic positioning.",
    levels: "46-60"
  },
  { 
    tier: "Serve Specialist", 
    color: "bg-gradient-to-r from-orange-200 to-orange-400 text-orange-800",
    description: "Developing advanced serving techniques and match strategies.",
    levels: "61-75"
  },
  { 
    tier: "Volley Virtuoso", 
    color: "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800",
    description: "Executing complex shots with precision and tactical awareness.",
    levels: "76-90"
  },
  { 
    tier: "Pickleball Pro", 
    color: "bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-800",
    description: "Achieving elite status with comprehensive mastery of the game.",
    levels: "91-100"
  }
];

interface TierProgressBarProps {
  currentTier: string;
  tierProgress: number;
  nextTier: string | null;
}

export function TierProgressBar({ 
  currentTier, 
  tierProgress, 
  nextTier 
}: TierProgressBarProps) {
  // Find the current tier's index
  const currentTierIndex = allTiers.findIndex(t => t.tier === currentTier);
  
  // If tier is not found (shouldn't happen), return null
  if (currentTierIndex === -1) return null;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Tier Progress</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                <Info className="h-4 w-4 text-gray-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Pickleball Progression Tiers</DialogTitle>
                <DialogDescription>
                  Advance through tiers by earning XP and leveling up your Pickle+ profile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {allTiers.map((tier, index) => (
                  <div 
                    key={tier.tier} 
                    className={cn(
                      "p-3 rounded-md", 
                      index === currentTierIndex ? tier.color : "bg-gray-100"
                    )}
                  >
                    <div className="font-medium">{tier.tier}</div>
                    <div className="text-sm opacity-90">{tier.description}</div>
                    <div className="text-xs mt-1">Levels: {tier.levels}</div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <span className="text-sm text-gray-500">{tierProgress}%</span>
      </div>
      
      {/* Progress bar showing all tiers */}
      <div className="h-3 rounded-full overflow-hidden flex mb-3">
        {allTiers.map((tier, index) => {
          // Width calculation - each tier gets equal space
          const segmentWidth = 100 / allTiers.length;
          
          // Base style for all segments
          let style = `w-[${segmentWidth}%]`;
          
          // Active tier has the progress indicator
          if (index === currentTierIndex) {
            return (
              <TooltipProvider key={tier.tier}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`relative ${style} overflow-hidden`}>
                      <div 
                        className={`absolute inset-0 opacity-30 ${tier.color.split(" ")[0]} ${tier.color.split(" ")[1]}`}
                      />
                      <div 
                        className={`h-full ${tier.color.split(" ")[0]} ${tier.color.split(" ")[1]}`}
                        style={{ width: `${tierProgress}%` }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tier.tier}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
          
          // Completed tiers are fully colored
          if (index < currentTierIndex) {
            return (
              <TooltipProvider key={tier.tier}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`${style} ${tier.color.split(" ")[0]} ${tier.color.split(" ")[1]}`} 
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tier.tier}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
          
          // Future tiers are grayed out
          return (
            <TooltipProvider key={tier.tier}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`${style} bg-gray-200`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tier.tier}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      {nextTier && (
        <p className="text-sm text-gray-500">
          {tierProgress}% progress to <span className="font-medium">{nextTier}</span>
        </p>
      )}
      
      {!nextTier && (
        <p className="text-sm text-emerald-600 font-medium">You've reached the highest tier! Congratulations!</p>
      )}
    </div>
  );
}