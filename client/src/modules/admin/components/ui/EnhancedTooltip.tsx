/**
 * PKL-278651-ADMIN-0014-UX
 * Enhanced Tooltip Component
 * 
 * This component provides enhanced tooltips with rich content support
 * for improved user experience in the admin dashboard.
 */

import React, { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from 'lucide-react';

interface EnhancedTooltipProps {
  children: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  iconClassName?: string;
  contentClassName?: string;
  showDelayed?: boolean;
  iconOnly?: boolean;
}

export function EnhancedTooltip({
  children,
  content,
  icon = <Info className="h-4 w-4" />,
  side = "top",
  align = "center",
  className = "",
  iconClassName = "",
  contentClassName = "",
  showDelayed = false,
  iconOnly = false
}: EnhancedTooltipProps) {
  return (
    <TooltipProvider delayDuration={showDelayed ? 300 : 0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center group ${className}`}>
            {!iconOnly && children}
            <span className={`text-muted-foreground/70 hover:text-muted-foreground ml-1 cursor-help ${iconClassName}`}>
              {icon}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className={`max-w-xs p-3 ${contentClassName}`}
        >
          <div className="text-sm">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * HelpTooltip - A specialized version of EnhancedTooltip specifically for help content
 */
export function HelpTooltip({
  content,
  side = "top",
  align = "center",
  className = "",
  contentClassName = "",
}: Omit<EnhancedTooltipProps, 'children' | 'icon' | 'iconOnly'>) {
  return (
    <EnhancedTooltip
      content={content}
      icon={<HelpCircle className="h-4 w-4" />}
      side={side}
      align={align}
      className={className}
      contentClassName={contentClassName}
      iconOnly={true}
      showDelayed={true}
    >
      {null}
    </EnhancedTooltip>
  );
}