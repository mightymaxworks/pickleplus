import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface XpMultiplierIndicatorProps {
  multiplier: number;
  className?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

export function XpMultiplierIndicator({
  multiplier,
  className,
  showLabel = true,
  showTooltip = true,
  size = "md"
}: XpMultiplierIndicatorProps) {
  // Only show if there's an actual multiplier greater than 1
  if (multiplier <= 1) return null;
  
  const formattedMultiplier = `${multiplier.toFixed(1)}x`;
  
  const indicator = (
    <div className={cn(
      "inline-flex items-center gap-1 text-amber-500 font-semibold",
      size === "sm" && "text-xs",
      size === "md" && "text-sm",
      size === "lg" && "text-base",
      className
    )}>
      <Sparkles className={cn(
        "text-amber-400",
        size === "sm" && "h-3 w-3",
        size === "md" && "h-4 w-4",
        size === "lg" && "h-5 w-5",
      )} />
      {showLabel && <span>{formattedMultiplier}</span>}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {indicator}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">You earn {formattedMultiplier} more XP as a Founding Member</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return indicator;
}