/**
 * PKL-278651-MATCH-0004-UIX: Enhanced Match Card Component
 * This component provides a modern, visually appealing match card with improved validation controls
 */
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { RecordedMatch, validateMatch } from '@/lib/sdk/matchSDK';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Info,
  Award,
  Users,
  Star,
  XCircle
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
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface EnhancedMatchCardProps {
  match: RecordedMatch;
  onValidationComplete?: () => void;
}

export function EnhancedMatchCard({ match, onValidationComplete }: EnhancedMatchCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  // Get the opponent's info - find the correct opponent based on player IDs
  const getCurrentOpponentId = () => {
    // Find the opponent's ID based on match structure
    if (match.playerOneId === user?.id) {
      return match.playerTwoId;
    } else if (match.playerTwoId === user?.id) {
      return match.playerOneId;
    }
    // For partner matches
    if (match.playerOnePartnerId === user?.id) {
      return match.playerTwoId; // Return team captain as opponent
    } else if (match.playerTwoPartnerId === user?.id) {
      return match.playerOneId; // Return team captain as opponent
    }
    return null;
  };
  
  // Get opponent ID and data
  const opponentId = getCurrentOpponentId();
  const opponent = opponentId && match.playerNames ? match.playerNames[opponentId] : null;

  // Check if the current user is the winner
  const isWinner = user?.id === match.winnerId;
  
  // Check match certification status (using new certificationStatus field)
  const certStatus = match.certificationStatus || match.validationStatus || 'pending';
  const isPending = certStatus === 'pending' || certStatus === 'in_review';
  const isDisputed = certStatus === 'disputed' || certStatus === 'rejected';
  const isValidated = match.isVerified || certStatus === 'certified' || certStatus === 'verified';
  const isExpired = certStatus === 'expired';

  // Check if the current user can validate the match
  const canValidate = isPending && user?.id !== match.playerOneId;

  // Format the match date
  const matchDate = match.matchDate ? format(parseISO(match.matchDate), 'MMM d, yyyy') : 'Unknown date';

  // Validation mutation
  const { mutate: submitValidation, isPending: isValidating } = useMutation({
    mutationFn: () => validateMatch(match.id, 'confirmed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recentMatches'] });
      toast({
        title: "Match validated",
        description: "The match has been successfully validated.",
        variant: "success"
      });
      setValidationDialogOpen(false);
      if (onValidationComplete) onValidationComplete();
    },
    onError: (error) => {
      toast({
        title: "Validation failed",
        description: `There was an error validating the match: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Dispute mutation
  const { mutate: submitDispute, isPending: isDisputing } = useMutation({
    mutationFn: () => validateMatch(match.id, 'disputed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recentMatches'] });
      toast({
        title: "Match disputed",
        description: "The match has been marked as disputed. An admin will review it.",
        variant: "default"
      });
      setValidationDialogOpen(false);
      if (onValidationComplete) onValidationComplete();
    },
    onError: (error) => {
      toast({
        title: "Dispute failed",
        description: `There was an error disputing the match: ${error}`,
        variant: "destructive"
      });
    }
  });

  const handleValidateClick = () => {
    setValidationDialogOpen(true);
  };

  const handleValidateConfirm = () => {
    submitValidation();
  };

  const handleDisputeConfirm = () => {
    submitDispute();
  };

  // Helper to get the status indicator 
  const getStatusIndicator = () => {
    if (isDisputed) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Disputed</span>
        </div>
      );
    } else if (isValidated) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="font-medium">Validated</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-amber-600">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Pending Validation</span>
        </div>
      );
    }
  };

  return (
    <div 
      className={cn(
        "border rounded-lg p-4 mb-4 transition-all duration-200 hover:shadow-md",
        isWinner ? "bg-green-50/50 dark:bg-green-950/20" : "bg-white dark:bg-gray-950",
        isPending ? "border-amber-200 dark:border-amber-800" : 
        isDisputed ? "border-red-200 dark:border-red-800" : 
        "border-gray-200 dark:border-gray-800"
      )}
    >
      {/* Header with date and match type */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{matchDate}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {match.matchType === 'tournament' ? 'Tournament' : 'Casual'}
        </Badge>
      </div>

      {/* Main card content */}
      <div className="grid grid-cols-7 gap-2 items-center">
        {/* Your side */}
        <div className="col-span-3 flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.displayName?.charAt(0) || "Y"}
            </div>
            <div className="hidden sm:block">
              <div className="font-medium">{user?.displayName || 'You'}</div>
              <div className="text-xs text-muted-foreground">@{user?.username || 'you'}</div>
            </div>
          </div>
          <div className="sm:hidden text-center mt-1">
            <div className="font-medium">{user?.displayName || 'You'}</div>
            <div className="text-xs text-muted-foreground">@{user?.username || 'you'}</div>
          </div>
        </div>

        {/* Score */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="text-2xl font-bold flex items-center gap-1">
            <span className={isWinner ? "text-primary" : ""}>{match.scorePlayerOne}</span>
            <span className="text-sm text-muted-foreground">:</span>
            <span className={!isWinner ? "text-primary" : ""}>{match.scorePlayerTwo}</span>
          </div>
          <div className="mt-1">
            {isWinner ? (
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 px-2 text-xs">
                Win
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800/40 px-2 text-xs">
                Loss
              </Badge>
            )}
          </div>
        </div>

        {/* Opponent side */}
        <div className="col-span-3 flex flex-col items-center sm:items-end">
          <div className="flex items-center gap-2 mb-2 flex-row-reverse">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold">
              {opponent?.avatarInitials || opponent?.displayName?.charAt(0) || "O"}
            </div>
            <div className="hidden sm:block text-right">
              <div className="font-medium">{opponent?.displayName || 'Opponent'}</div>
              <div className="text-xs text-muted-foreground">@{opponent?.username || 'opponent'}</div>
            </div>
          </div>
          <div className="sm:hidden text-center mt-1">
            <div className="font-medium">{opponent?.displayName || 'Opponent'}</div>
            <div className="text-xs text-muted-foreground">@{opponent?.username || 'opponent'}</div>
          </div>
        </div>
      </div>

      {/* Validation status and controls */}
      <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          {/* Status indicator */}
          {getStatusIndicator()}
          
          {/* Validation buttons */}
          {isPending && canValidate && (
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant="outline"
                className="text-xs border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                onClick={handleValidateClick}
                disabled={isValidating || isDisputing}
              >
                Validate Match
              </Button>
            </div>
          )}
          
          {/* Match details toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-7 w-7 ml-auto"
            onClick={() => setDetailsOpen(!detailsOpen)}
          >
            {detailsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible details */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleContent className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              <span>{match.formatType === 'singles' ? 'Singles' : 'Doubles'}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              <span>{match.division || 'Open'} Division</span>
            </div>
            {match.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{match.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Award className="h-3.5 w-3.5" />
              <span>{match.eventTier || 'Local'} Event</span>
            </div>
          </div>

          {/* Game scores */}
          {match.gameScores && match.gameScores.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-medium mb-2">Game Scores</h4>
              <div className="space-y-2">
                {match.gameScores.map((game, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Game {index + 1}</span>
                    <div className="font-medium">
                      {game.playerOneScore} - {game.playerTwoScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match notes */}
          {match.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                <span>Notes</span>
              </h4>
              <p className="text-sm text-muted-foreground italic">{match.notes}</p>
            </div>
          )}

          {/* Rewards */}
          {((match.xpAwarded && match.xpAwarded > 0) || (match.pointsAwarded && match.pointsAwarded > 0)) && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-medium mb-2">Rewards</h4>
              <div className="flex gap-4">
                {match.xpAwarded && match.xpAwarded > 0 && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <span className="font-medium">+{match.xpAwarded} XP</span>
                  </div>
                )}
                {match.pointsAwarded && match.pointsAwarded > 0 && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span className="font-medium">+{match.pointsAwarded} CP</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Validation dialog */}
      <AlertDialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validate Match</AlertDialogTitle>
            <AlertDialogDescription>
              Do you confirm that the match result is correct? This action cannot be undone.
              
              {match.formatType === 'singles' ? (
                <div className="mt-3 text-sm">
                  <strong>{user?.displayName || 'You'}</strong> vs <strong>{opponent?.displayName || 'Opponent'}</strong>
                  <br />
                  Score: <strong>{match.scorePlayerOne} - {match.scorePlayerTwo}</strong>
                </div>
              ) : (
                <div className="mt-3 text-sm">
                  <strong>Doubles Match</strong><br />
                  Score: <strong>{match.scorePlayerOne} - {match.scorePlayerTwo}</strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
              onClick={handleDisputeConfirm}
              disabled={isValidating || isDisputing}
            >
              {isDisputing ? "Disputing..." : "Dispute Result"}
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                variant="default"
                onClick={handleValidateConfirm}
                disabled={isValidating || isDisputing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isValidating ? "Validating..." : "Confirm Match"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}