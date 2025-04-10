/**
 * PKL-278651-VALMAT-0002-UI: Quick Match Validation Button
 * 
 * This component provides a quick action button to validate matches directly from match cards
 * without needing to open the full validation dialog.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { RecordedMatch, matchSDK } from '@/lib/sdk/matchSDK';
import { queryClient } from '@/lib/queryClient';
import { 
  CheckCircle,
  Clock, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickValidationButtonProps {
  match: RecordedMatch;
  size?: 'default' | 'sm';
  variant?: 'default' | 'outline' | 'ghost';
  onValidationComplete?: () => void;
  className?: string;
}

export function QuickValidationButton({ 
  match, 
  size = 'sm', 
  variant = 'outline',
  onValidationComplete,
  className = ''
}: QuickValidationButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  // Handle validation
  const handleValidate = async () => {
    if (!user) return;
    
    try {
      setIsValidating(true);
      await matchSDK.validateMatch(match.id, 'confirmed', '');
      
      toast({
        title: "Match Confirmed",
        description: "You've successfully validated this match result.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/match/recent'] });
      queryClient.invalidateQueries({ queryKey: [`/api/match/${match.id}/validations`] });
      
      if (onValidationComplete) {
        onValidationComplete();
      }
    } catch (error) {
      console.error("Error confirming match:", error);
      toast({
        title: "Validation Failed",
        description: "There was an error confirming the match.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Determine button label based on match status
  const getButtonLabel = () => {
    if (match.validationStatus === 'disputed') {
      return 'Disputed';
    } else if (match.validationStatus === 'validated') {
      return 'Validated';
    } else if (match.validationStatus === 'confirmed') {
      return 'Confirmed';
    } else {
      return 'Validate';
    }
  };

  // Check if current user has already validated
  const hasUserValidated = () => {
    // Default to true for validated matches
    if (match.validationStatus === 'validated') return true;
    
    // For matches with participant validation details
    // Note: in a real scenario, we would fetch validation details first
    // For now, we'll just check the status as a simplified approach
    if (match.validationStatus === 'confirmed' && user) {
      // In a real implementation we would check if the user has already validated
      return false; // Simplified for now
    }
    
    return false;
  };

  // Button is disabled if match is already validated or the user has already validated
  const isDisabled = match.validationStatus === 'validated' || 
                     match.validationStatus === 'disputed' || 
                     hasUserValidated() || 
                     isValidating;

  // Render icon based on status
  const renderStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 mr-1 animate-spin" />;
    } else if (match.validationStatus === 'disputed') {
      return <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />;
    } else if (match.validationStatus === 'validated' || match.validationStatus === 'confirmed') {
      return <CheckCircle className="h-4 w-4 mr-1 text-green-500" />;
    } else {
      return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button 
                variant={variant} 
                size={size}
                className={`flex items-center ${className}`}
                disabled={isDisabled}
                type="button"
                onClick={(e) => {
                  // Prevent the event from being lost
                  e.stopPropagation();
                }}
              >
                {renderStatusIcon()}
                {getButtonLabel()}
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {match.validationStatus === 'disputed' 
              ? 'This match has been disputed'
              : match.validationStatus === 'validated' 
                ? 'This match has been validated by all participants'
                : match.validationStatus === 'confirmed'
                  ? 'This match has been confirmed' 
                  : hasUserValidated()
                    ? 'You have already validated this match'
                    : 'Quickly confirm this match result'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Match Result</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to validate this match result? This action confirms that the score and outcome are correct.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleValidate}>
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Match
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}