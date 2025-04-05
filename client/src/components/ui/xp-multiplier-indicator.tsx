import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface XpMultiplierIndicatorProps {
  multiplier: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function XpMultiplierIndicator({ 
  multiplier,
  size = "md",
  showLabel = false,
  showTooltip = false,
  className
}: XpMultiplierIndicatorProps) {
  // Convert from percentage (110) to decimal multiplier (1.1x)
  const formattedMultiplier = `${(multiplier / 100).toFixed(1)}x`;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  const content = (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-yellow-100 text-yellow-800 border-yellow-400 font-medium",
        sizeClasses[size],
        className
      )}
    >
      {showLabel ? (
        <span>
          <span className="font-bold">{formattedMultiplier}</span> XP Multiplier
        </span>
      ) : (
        <span className="font-bold">{formattedMultiplier}</span>
      )}
    </Badge>
  );
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>Founding Member Bonus: All XP is multiplied by {formattedMultiplier}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return content;
}