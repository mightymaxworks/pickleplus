/**
 * RatingBadge Component
 * 
 * A visual indicator of a player's rating tier with optional rating display.
 * Part of the CourtIQ™ Design System.
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { colors } from "../../tokens/colors";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy } from "lucide-react";

// Mapping of tier names to colors
const tierColorMap: Record<string, { bg: string; text: string; border: string }> = {
  "Grand Master": { bg: "bg-[#FFD700]/10", text: "text-[#FFD700]", border: "border-[#FFD700]" },
  "Master": { bg: "bg-[#9C27B0]/10", text: "text-[#9C27B0]", border: "border-[#9C27B0]" },
  "Diamond": { bg: "bg-[#3F51B5]/10", text: "text-[#3F51B5]", border: "border-[#3F51B5]" },
  "Platinum": { bg: "bg-[#607D8B]/10", text: "text-[#607D8B]", border: "border-[#607D8B]" },
  "Gold": { bg: "bg-[#FF9800]/10", text: "text-[#FF9800]", border: "border-[#FF9800]" },
  "Silver": { bg: "bg-[#9E9E9E]/10", text: "text-[#9E9E9E]", border: "border-[#9E9E9E]" },
  "Bronze": { bg: "bg-[#795548]/10", text: "text-[#795548]", border: "border-[#795548]" },
  "Challenger": { bg: "bg-[#4CAF50]/10", text: "text-[#4CAF50]", border: "border-[#4CAF50]" },
  "Contender": { bg: "bg-[#2196F3]/10", text: "text-[#2196F3]", border: "border-[#2196F3]" },
  "Rookie": { bg: "bg-[#00BCD4]/10", text: "text-[#00BCD4]", border: "border-[#00BCD4]" },
  "Unrated": { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" },
};

// Format descriptions
const formatDescriptions: Record<string, string> = {
  "Singles": "One vs One play",
  "Doubles": "Team play with same gender partner",
  "Mixed Doubles": "Team play with mixed gender partner",
};

interface RatingBadgeProps {
  tier: string;
  rating: number;
  format: string;
  size?: "sm" | "md" | "lg";
  showRating?: boolean;
  showFormat?: boolean;
  className?: string;
}

/**
 * A badge component that displays a player's rating tier with configurable options.
 */
export function RatingBadge({
  tier,
  rating,
  format,
  size = "md",
  showRating = false,
  showFormat = false,
  className,
}: RatingBadgeProps) {
  const tierStyle = tierColorMap[tier] || tierColorMap["Unrated"];
  
  // Size variants
  const sizeClasses = {
    sm: "text-xs py-0 px-1.5",
    md: "text-xs py-0.5 px-2",
    lg: "text-sm py-1 px-2.5",
  };
  
  const badgeContent = (
    <Badge 
      variant="outline" 
      className={cn(
        tierStyle.bg, 
        tierStyle.text, 
        "border", 
        tierStyle.border,
        sizeClasses[size],
        className
      )}
    >
      {showRating ? `${tier} (${rating})` : tier}
    </Badge>
  );
  
  // If not showing format or no tooltip is needed, return badge directly
  if (!showFormat) {
    return badgeContent;
  }
  
  // With tooltip showing format information
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium flex items-center">
            <Trophy className="h-3 w-3 mr-1" /> {format}
          </p>
          <p className="text-xs opacity-80">
            {formatDescriptions[format] || "CourtIQ™ Rating"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}