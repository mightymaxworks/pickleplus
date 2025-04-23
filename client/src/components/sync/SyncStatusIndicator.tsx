/**
 * SyncStatusIndicator Component
 * 
 * Displays the current sync status and provides manual sync control
 * when there are pending items in the sync queue.
 * 
 * @module SyncStatusIndicator
 * @version 1.0.0
 * @framework Framework5.3
 * @lastModified 2025-04-23
 */

import React, { useEffect, useState } from 'react';
import { CircleSlash, CloudOff, Cloud, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { syncManager, type SyncStatus } from '@/lib/services/sync-manager';
import featureFlags from '@/lib/featureFlags';

/**
 * Sync Status Indicator Component Props
 */
interface SyncStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'outline';
}

/**
 * A component that displays sync status and allows manual sync
 */
export function SyncStatusIndicator({
  className = '',
  showLabel = false,
  showCount = true,
  size = 'md',
  variant = 'subtle'
}: SyncStatusIndicatorProps) {
  // State
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());
  const [queueCount, setQueueCount] = useState<number>(syncManager.getQueueCount());
  const [isOnline, setIsOnline] = useState<boolean>(syncManager.isNetworkOnline());
  const [isSyncing, setIsSyncing] = useState<boolean>(status === 'syncing');
  
  // Only show if enabled in feature flags
  const showSyncStatus = featureFlags.getFeatureFlag('showSyncStatus');
  const showOfflineIndicator = featureFlags.getFeatureFlag('showOfflineIndicator');
  
  if (!showSyncStatus && !(showOfflineIndicator && !isOnline)) {
    return null;
  }
  
  // Set up event listeners for sync manager
  useEffect(() => {
    // Update state on sync events
    const syncEvents = {
      onSyncStart: () => {
        setStatus('syncing');
        setIsSyncing(true);
      },
      onSyncComplete: () => {
        setStatus('completed');
        setIsSyncing(false);
        setQueueCount(syncManager.getQueueCount());
      },
      onSyncFail: () => {
        setStatus('failed');
        setIsSyncing(false);
        setQueueCount(syncManager.getQueueCount());
      }
    };
    
    // Register events with sync manager
    syncManager.registerEvents(syncEvents);
    
    // Poll for status updates
    const intervalId = setInterval(() => {
      setStatus(syncManager.getStatus());
      setQueueCount(syncManager.getQueueCount());
      setIsOnline(syncManager.isNetworkOnline());
    }, 5000);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Handle manual sync
  const handleManualSync = () => {
    if (isOnline && !isSyncing) {
      syncManager.triggerSync();
    }
  };
  
  // Size variants
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  
  // Only show if offline or has items to sync
  if (!showOfflineIndicator && isOnline && queueCount === 0) {
    return null;
  }
  
  // Offline indicator
  if (!isOnline) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            <Badge variant="destructive" className="flex items-center gap-1">
              <CloudOff size={iconSize} />
              {showLabel && <span>Offline</span>}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>You're currently offline. Changes will sync when you reconnect.</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  // No items to sync
  if (queueCount === 0) {
    return null;
  }
  
  // Loading indicator when syncing
  if (status === 'syncing') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            <Badge variant="secondary" className="flex items-center gap-1">
              <RefreshCw size={iconSize} className="animate-spin" />
              {showLabel && <span>Syncing</span>}
              {showCount && queueCount > 0 && <span className="ml-1">{queueCount}</span>}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Syncing data with server...</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  // Items waiting to sync
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1 h-6 px-2 ${className}`}
          onClick={handleManualSync}
        >
          <Cloud size={iconSize} className="text-amber-500" />
          {showLabel && <span>Sync</span>}
          {showCount && queueCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              {queueCount}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {queueCount} {queueCount === 1 ? 'item' : 'items'} waiting to sync. 
          Click to sync now.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export default SyncStatusIndicator;