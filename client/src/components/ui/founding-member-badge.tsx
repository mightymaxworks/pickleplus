import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FoundingMemberBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  variant?: "default" | "outline";
}

export function FoundingMemberBadge({
  className,
  size = "md",
  showTooltip = true,
  variant = "default"
}: FoundingMemberBadgeProps) {
  const badge = (
    <Badge 
      variant={variant} 
      className={cn(
        "bg-gradient-to-r from-amber-400 to-yellow-600 border-amber-300 text-white flex items-center gap-1",
        size === "sm" && "text-xs py-0 px-1.5",
        size === "md" && "text-xs py-0.5 px-2",
        size === "lg" && "text-sm py-1 px-3",
        variant === "outline" && "bg-transparent border-amber-300 text-amber-600",
        className
      )}
    >
      <Crown className={cn(
        "text-amber-100",
        size === "sm" && "h-3 w-3",
        size === "md" && "h-3.5 w-3.5",
        size === "lg" && "h-4 w-4",
        variant === "outline" && "text-amber-500"
      )} />
      <span>Founding Member</span>
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Founding members receive a 1.1x XP multiplier on all activities</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}