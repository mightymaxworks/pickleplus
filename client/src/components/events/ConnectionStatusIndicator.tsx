/**
 * PKL-278651-CONN-0012-SYNC - Event Status Synchronization
 * 
 * ConnectionStatusIndicator Component
 * 
 * This component displays the current WebSocket connection status,
 * helping users understand if they're getting real-time updates.
 * 
 * @implementation Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { WifiIcon, WifiOffIcon, AlertCircleIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  isEnabled: boolean;
  className?: string;
  showLabel?: boolean;
}

export function ConnectionStatusIndicator({
  isConnected,
  isEnabled,
  className,
  showLabel = false
}: ConnectionStatusIndicatorProps) {
  // If WebSockets are completely disabled, we show a different message
  const tooltipContent = isEnabled
    ? isConnected
      ? "Connected: Real-time updates active"
      : "Disconnected: Using periodic updates"
    : "Real-time updates unavailable. Using automatic refresh";

  // Get appropriate icon based on state
  const Icon = isConnected ? WifiIcon : isEnabled ? AlertCircleIcon : WifiOffIcon;
  
  // Get appropriate color based on state
  const iconColorClass = isConnected 
    ? "text-green-500" 
    : isEnabled 
      ? "text-amber-500" 
      : "text-red-500";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-2", className)}>
          <Icon
            className={cn("h-4 w-4", iconColorClass)}
            aria-hidden="true"
          />
          {showLabel && (
            <span className={cn("text-xs font-medium", iconColorClass)}>
              {isConnected ? "Connected" : "Offline"}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        <p className="text-xs">{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default ConnectionStatusIndicator;