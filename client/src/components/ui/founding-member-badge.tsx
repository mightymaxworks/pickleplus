import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import foundingMemberBadge from "../../assets/founding-member-badge.png";

interface FoundingMemberBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function FoundingMemberBadge({ 
  className, 
  size = "md", 
  showText = true
}: FoundingMemberBadgeProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1 border border-yellow-400 bg-yellow-50 px-2 py-0.5 text-yellow-800",
        className
      )}
    >
      <img 
        src={foundingMemberBadge} 
        alt="Founding Member" 
        className={cn(sizeClasses[size])}
      />
      {showText && <span className="text-xs font-medium">Founding Member</span>}
    </Badge>
  );
}