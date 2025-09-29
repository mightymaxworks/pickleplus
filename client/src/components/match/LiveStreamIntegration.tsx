import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Share2, 
  Copy, 
  Video, 
  Wifi, 
  WifiOff,
  Eye,
  Users,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  useLiveStreamValidator, 
  generateViewerLink, 
  shouldEnableGamingFeatures,
  type LiveStreamValidation 
} from './LiveStreamValidator';

interface LiveStreamIntegrationProps {
  onValidationChange?: (validation: LiveStreamValidation) => void;
  onGamingFeaturesToggle?: (enabled: boolean) => void;
  onViewerLinkGenerated?: (link: string) => void;
  matchId?: string;
  className?: string;
}

export default function LiveStreamIntegration({
  onValidationChange,
  onGamingFeaturesToggle,
  onViewerLinkGenerated,
  matchId = 'live-match-' + Date.now(),
  className = ''
}: LiveStreamIntegrationProps) {
  const [streamUrl, setStreamUrl] = useState('');
  const [viewerLink, setViewerLink] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { validation, validateStream, clearValidation } = useLiveStreamValidator();
  const { toast } = useToast();

  // Auto-validate when URL changes (with debounce)
  useEffect(() => {
    if (!streamUrl.trim()) {
      clearValidation();
      return;
    }

    const timeoutId = setTimeout(() => {
      validateStream(streamUrl);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [streamUrl, validateStream, clearValidation]);

  // Notify parent components of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validation);
    }

    const gamingEnabled = shouldEnableGamingFeatures(validation);
    if (onGamingFeaturesToggle) {
      onGamingFeaturesToggle(gamingEnabled);
    }

    // Generate viewer link for valid streams
    if (validation.isValid && validation.embedUrl) {
      const link = generateViewerLink(matchId, validation.embedUrl);
      setViewerLink(link);
      if (onViewerLinkGenerated) {
        onViewerLinkGenerated(link);
      }
    } else {
      setViewerLink('');
    }
  }, [validation, matchId, onValidationChange, onGamingFeaturesToggle, onViewerLinkGenerated]);

  const copyViewerLink = async () => {
    if (!viewerLink) return;
    
    try {
      await navigator.clipboard.writeText(viewerLink);
      toast({
        title: "Viewer link copied!",
        description: "Share this link with your audience to watch live",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    if (validation.isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (validation.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Video className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (validation.isLoading) return "Validating stream...";
    if (validation.isValid) return `Live ${validation.streamType} stream detected`;
    if (validation.error) return validation.error;
    return "Enter live stream URL to enable gaming features";
  };

  const getStatusColor = () => {
    if (validation.isLoading) return "text-blue-600";
    if (validation.isValid) return "text-green-600";
    if (validation.error) return "text-red-600";
    return "text-gray-500";
  };

  const platformBadgeColor = {
    youtube: "bg-red-100 text-red-700",
    twitch: "bg-purple-100 text-purple-700", 
    vimeo: "bg-blue-100 text-blue-700",
    direct: "bg-gray-100 text-gray-700"
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              {shouldEnableGamingFeatures(validation) ? (
                <Wifi className="h-5 w-5 text-orange-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">Live Stream Setup</h3>
              <p className="text-sm text-gray-600">
                Add a live video to unlock gaming features
              </p>
            </div>
          </div>

          {shouldEnableGamingFeatures(validation) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                Gaming Mode Active
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Stream URL Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Paste YouTube, Twitch, or Vimeo live stream URL..."
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getStatusIcon()}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {/* Status Display */}
          <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
            {validation.streamType && (
              <Badge 
                variant="secondary" 
                className={platformBadgeColor[validation.streamType]}
              >
                {validation.streamType.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 border-t pt-4"
            >
              {/* Gaming Features Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Gaming Features
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Momentum Wave</span>
                      <Badge variant={shouldEnableGamingFeatures(validation) ? "default" : "secondary"}>
                        {shouldEnableGamingFeatures(validation) ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Crowd Energy</span>
                      <Badge variant={shouldEnableGamingFeatures(validation) ? "default" : "secondary"}>
                        {shouldEnableGamingFeatures(validation) ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Hero Mode</span>
                      <Badge variant={shouldEnableGamingFeatures(validation) ? "default" : "secondary"}>
                        {shouldEnableGamingFeatures(validation) ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Viewer Link Generation */}
                {validation.isValid && viewerLink && (
                  <div className="p-4 rounded-lg bg-green-50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Viewer Link Ready
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Users className="h-3 w-3" />
                        <span>Share with your audience</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={viewerLink}
                          readOnly
                          className="text-xs bg-white"
                        />
                        <Button
                          size="sm"
                          onClick={copyViewerLink}
                          className="shrink-0"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Text */}
              <div className="p-3 rounded-lg bg-blue-50 text-sm text-blue-700">
                <p className="font-medium mb-1">Supported Platforms:</p>
                <ul className="space-y-1 text-xs">
                  <li>• YouTube Live streams and premieres</li>
                  <li>• Twitch live channels</li>
                  <li>• Vimeo live events</li>
                  <li>• Direct HLS/RTMP stream URLs</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}