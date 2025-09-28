import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { validateStreamUrl } from './LiveStreamValidator';

interface LiveStreamIntegrationProps {
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

export default function LiveStreamIntegration({
  onValidationChange,
  className = ''
}: LiveStreamIntegrationProps) {
  const [streamUrl, setStreamUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
    streamType?: string;
  } | null>(null);
  const { toast } = useToast();

  const handleValidate = async () => {
    if (!streamUrl.trim()) {
      toast({
        title: "No URL provided",
        description: "Please enter a stream URL first",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateStreamUrl(streamUrl);
      setValidationResult(result);
      
      if (onValidationChange) {
        onValidationChange(result.isValid);
      }
      
      if (result.isValid) {
        toast({
          title: "Stream validated!",
          description: `${result.streamType} live stream detected - gaming features enabled`,
        });
      } else {
        toast({
          title: "Invalid stream",
          description: result.error || "Stream is not live or accessible",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorResult = { isValid: false, error: "Validation failed" };
      setValidationResult(errorResult);
      if (onValidationChange) {
        onValidationChange(false);
      }
      toast({
        title: "Validation failed",
        description: "Could not validate stream URL",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
    }
    if (validationResult?.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
    if (validationResult?.error) {
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
    return <Video className="h-4 w-4 text-slate-400" />;
  };

  const getStatusText = () => {
    if (isValidating) return "Checking stream...";
    if (validationResult?.isValid) return `Live ${validationResult.streamType} stream detected`;
    if (validationResult?.error) return validationResult.error;
    return "Enter live stream URL to enable gaming features";
  };

  const getStatusColor = () => {
    if (isValidating) return "text-blue-400";
    if (validationResult?.isValid) return "text-green-400";
    if (validationResult?.error) return "text-red-400";
    return "text-slate-400";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="font-semibold text-white mb-1">Live Stream (Optional)</h3>
        <p className="text-sm text-slate-400">
          Add a live video URL to unlock gaming features
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Paste YouTube, Twitch, or Vimeo live stream URL..."
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          className="bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-orange-400"
        />
        <Button
          onClick={handleValidate}
          disabled={!streamUrl.trim() || isValidating}
          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Validate'
          )}
        </Button>
      </div>

      <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
    </div>
  );
}