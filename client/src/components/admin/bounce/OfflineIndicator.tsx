/**
 * PKL-278651-BOUNCE-0006-MOBILE - Bounce Mobile Optimization
 * Offline Status Indicator Component
 * 
 * This component displays the current network connectivity status and provides
 * visual indication when working with stale (cached) data in offline mode.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OfflineIndicatorProps } from '@/lib/services/offlineCache';
import { cn } from '@/lib/utils';

interface OfflineIndicatorComponentProps extends OfflineIndicatorProps {
  onRefresh?: () => void;
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorComponentProps> = ({
  isOnline,
  wasOffline,
  isStale,
  onRefresh,
  className
}) => {
  // Don't render anything if online and data is fresh
  if (isOnline && !isStale && !wasOffline) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {!isOnline && (
        <Alert variant="destructive" className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex-1">
            You're currently offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      {isOnline && wasOffline && (
        <Alert variant="default" className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800">
          <Wifi className="h-4 w-4" />
          <AlertDescription className="flex-1">
            You're back online! Syncing data...
          </AlertDescription>
          <CheckCircle2 className="h-4 w-4 text-green-500 animate-pulse" />
        </Alert>
      )}

      {isStale && isOnline && (
        <Alert variant="default" className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="flex-1">
            You're viewing cached data that may be out of date.
          </AlertDescription>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="ml-2 gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          )}
        </Alert>
      )}
    </div>
  );
};

export default OfflineIndicator;