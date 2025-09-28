/**
 * StreamStatusIndicator - Visual indicator for live vs recorded stream status
 * Shows gaming features availability and stream health
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  PlayCircle, 
  WifiOff, 
  Users, 
  Gamepad2,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MatchMode, GamingFeatures, MatchState } from './MatchStateManager';

interface StreamStatusIndicatorProps {
  matchState: MatchState;
  onModeToggle?: (mode: MatchMode) => void;
  className?: string;
  compact?: boolean;
}

export function StreamStatusIndicator({ 
  matchState, 
  onModeToggle,
  className,
  compact = false 
}: StreamStatusIndicatorProps) {
  const { mode, isLive, streamState, gamingFeatures, viewerCount } = matchState;

  const getStatusConfig = () => {
    switch (mode) {
      case 'live':
        return {
          icon: Radio,
          label: 'LIVE',
          color: 'bg-red-500 text-white',
          pulse: true,
          description: 'Gaming features active'
        };
      case 'recorded':
        return {
          icon: PlayCircle,
          label: 'RECORDED',
          color: 'bg-blue-500 text-white',
          pulse: false,
          description: 'Analysis mode'
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'OFFLINE',
          color: 'bg-gray-500 text-white',
          pulse: false,
          description: 'No stream detected'
        };
      default:
        return {
          icon: Loader2,
          label: 'DETECTING',
          color: 'bg-yellow-500 text-white',
          pulse: true,
          description: 'Checking stream status...'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  const getGamingFeaturesCount = () => {
    return Object.values(gamingFeatures).filter(Boolean).length;
  };

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("flex items-center gap-2", className)}
      >
        <Badge 
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs font-bold",
            statusConfig.color
          )}
        >
          <Icon 
            size={12} 
            className={cn(
              statusConfig.pulse && mode === 'live' && "animate-pulse",
              mode === 'offline' && "animate-spin"
            )} 
          />
          {statusConfig.label}
        </Badge>
        
        {isLive && viewerCount > 0 && (
          <Badge variant="outline" className="text-xs">
            <Users size={10} className="mr-1" />
            {viewerCount}
          </Badge>
        )}
      </motion.div>
    );
  }

  return (
    <Card className={cn("p-4 border-2", className)}>
      <div className="space-y-3">
        {/* Main Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              statusConfig.color
            )}>
              <Icon 
                size={20} 
                className={cn(
                  statusConfig.pulse && "animate-pulse",
                  mode === 'offline' && "animate-spin"
                )} 
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{statusConfig.label}</span>
                {mode === 'live' && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {statusConfig.description}
              </p>
            </div>
          </div>

          {/* Mode Toggle for Testing */}
          {onModeToggle && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={mode === 'live' ? 'default' : 'outline'}
                onClick={() => onModeToggle('live')}
                className="text-xs"
              >
                Live
              </Button>
              <Button
                size="sm"
                variant={mode === 'recorded' ? 'default' : 'outline'}
                onClick={() => onModeToggle('recorded')}
                className="text-xs"
              >
                Recorded
              </Button>
            </div>
          )}
        </div>

        {/* Gaming Features Status */}
        <AnimatePresence>
          {isLive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Gamepad2 size={16} className="text-purple-400" />
                <span className="text-sm font-medium">Gaming Features</span>
                <Badge variant="secondary" className="text-xs">
                  {getGamingFeaturesCount()}/8 Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <GamingFeatureItem 
                  label="Crowd Energy" 
                  enabled={gamingFeatures.crowdEnergyMeter} 
                />
                <GamingFeatureItem 
                  label="Hype Train" 
                  enabled={gamingFeatures.hypeTrainEffects} 
                />
                <GamingFeatureItem 
                  label="Live Chat" 
                  enabled={gamingFeatures.liveChat} 
                />
                <GamingFeatureItem 
                  label="Predictions" 
                  enabled={gamingFeatures.predictionMarkets} 
                />
                <GamingFeatureItem 
                  label="Emotes" 
                  enabled={gamingFeatures.emoteReactions} 
                />
                <GamingFeatureItem 
                  label="Commentary" 
                  enabled={gamingFeatures.liveCommentary} 
                />
                <GamingFeatureItem 
                  label="Instant Replay" 
                  enabled={gamingFeatures.instantReplay} 
                />
                <GamingFeatureItem 
                  label="Social Share" 
                  enabled={gamingFeatures.socialSharing} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Viewer Count & Stream Info */}
        {isLive && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-blue-400" />
              <span>{viewerCount} viewers</span>
            </div>
            
            {streamState.latency && (
              <Badge variant="outline" className="text-xs">
                {streamState.latency}ms delay
              </Badge>
            )}
          </div>
        )}

        {/* Stream Health */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {streamState.status === 'live' ? (
            <>
              <CheckCircle size={12} className="text-green-500" />
              Stream healthy
            </>
          ) : streamState.status === 'detecting' ? (
            <>
              <Loader2 size={12} className="animate-spin text-yellow-500" />
              Detecting stream...
            </>
          ) : (
            <>
              <AlertCircle size={12} className="text-orange-500" />
              Stream {streamState.status}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

interface GamingFeatureItemProps {
  label: string;
  enabled: boolean;
}

function GamingFeatureItem({ label, enabled }: GamingFeatureItemProps) {
  return (
    <div className="flex items-center gap-1">
      {enabled ? (
        <CheckCircle size={12} className="text-green-500" />
      ) : (
        <AlertCircle size={12} className="text-gray-400" />
      )}
      <span className={cn(
        "text-xs",
        enabled ? "text-foreground" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
}