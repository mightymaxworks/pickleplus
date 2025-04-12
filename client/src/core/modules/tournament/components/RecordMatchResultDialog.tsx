/**
 * PKL-278651-TOURN-0017-SCORE
 * Enhanced Record Match Result Dialog with Visual Score Input
 * 
 * Dialog for recording tournament match results with comprehensive state synchronization
 * mechanisms to ensure bracket visualization updates consistently across the system.
 * Implements Framework 5.0 redundant update mechanisms with optimized cache invalidation.
 * 
 * Enhanced with visual score input for a more intuitive user experience.
 */

import { useState, useCallback } from "react";
import { useTournamentChanges } from "../context/TournamentChangeContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TournamentMatchScoreInput, MatchScore, GameScore, ScoringFormat, MatchFormat } from "./TournamentMatchScoreInput";

// Import enhanced API client functions
import { recordMatchResult } from "../api/brackets";
import { MatchResult, TournamentError, TournamentErrorCode } from "../types";

// Schema for match result with enhanced validation
const matchResultSchema = z.object({
  winnerId: z.number({
    required_error: "Please select a winner",
  }),
  score: z.string().min(1, "Please enter a score"),
  notes: z.string().optional(),
});

type MatchResultFormValues = z.infer<typeof matchResultSchema>;

interface RecordMatchResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number;
  team1?: { id: number; teamName: string } | null;
  team2?: { id: number; teamName: string } | null;
  onSuccess?: () => void;
}

export function RecordMatchResultDialog({
  open,
  onOpenChange,
  matchId,
  team1,
  team2,
  onSuccess,
}: RecordMatchResultDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Enhanced score data state with support for multi-game matches
  const [scoreData, setScoreData] = useState<MatchScore>({ 
    team1Score: 0, 
    team2Score: 0, 
    scoreFormat: "0-0",
    scoringType: "traditional",
    matchFormat: "single",
    games: [{ team1Score: 0, team2Score: 0 }],
    team1GamesWon: 0,
    team2GamesWon: 0
  });
  const [selectedWinnerId, setSelectedWinnerId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const tournamentChanges = useTournamentChanges();

  // Form setup with validation
  const form = useForm<MatchResultFormValues>({
    resolver: zodResolver(matchResultSchema),
    defaultValues: {
      score: "0-0",
      notes: "",
    },
  });
  
  // Handle winner selection from score component
  const handleWinnerSelection = (winnerId: number) => {
    setSelectedWinnerId(winnerId);
    form.setValue("winnerId", winnerId);
  };
  
  // Handle score data changes from visual component
  const handleScoreChange = (newScoreData: MatchScore) => {
    setScoreData(newScoreData);
    
    // Create a formatted score string that includes scoring and match format information
    let formattedScore: string;
    
    // For multi-game formats, build a comprehensive score string
    if (newScoreData.matchFormat && newScoreData.matchFormat !== 'single' && newScoreData.games && newScoreData.games.length > 1) {
      // Format like "21-15, 19-21, 21-18" for multiple games
      formattedScore = newScoreData.games.map(game => `${game.team1Score}-${game.team2Score}`).join(', ');
      
      // Add match format information
      if (newScoreData.matchFormat === 'best_of_3') {
        formattedScore += ' (Best of 3)';
      } else if (newScoreData.matchFormat === 'best_of_5') {
        formattedScore += ' (Best of 5)';
      }
      
      // Add final result
      if (newScoreData.team1GamesWon !== undefined && newScoreData.team2GamesWon !== undefined) {
        formattedScore += ` [${newScoreData.team1GamesWon}-${newScoreData.team2GamesWon}]`;
      }
    } else {
      // Single game format
      if (newScoreData.scoreFormat) {
        formattedScore = newScoreData.scoreFormat;
      } else {
        formattedScore = `${newScoreData.team1Score}-${newScoreData.team2Score}`;
      }
      
      // Add scoring format information if available
      if (newScoreData.scoringType && newScoreData.scoringType !== 'custom') {
        formattedScore += ` (${newScoreData.scoringType})`;
      }
    }
    
    // Update the form's score field with the formatted score
    form.setValue("score", formattedScore);
    
    // Update the winner selection based on the match format
    if (team1?.id && team2?.id) {
      let winnerId: number | null = null;
      
      if (newScoreData.matchFormat === 'single') {
        // Single game: winner is the team with the higher score in the one game
        if (newScoreData.team1Score > newScoreData.team2Score && 
            newScoreData.team1Score >= 21 && 
            (newScoreData.team1Score - newScoreData.team2Score) >= 2) {
          winnerId = team1.id;
        } else if (newScoreData.team2Score > newScoreData.team1Score && 
                  newScoreData.team2Score >= 21 && 
                  (newScoreData.team2Score - newScoreData.team1Score) >= 2) {
          winnerId = team2.id;
        }
      } else if (newScoreData.team1GamesWon !== undefined && newScoreData.team2GamesWon !== undefined) {
        // Multi-game: winner is the team that won more games
        const winThreshold = newScoreData.matchFormat === 'best_of_3' ? 2 : 3;
        
        if (newScoreData.team1GamesWon >= winThreshold) {
          winnerId = team1.id;
        } else if (newScoreData.team2GamesWon >= winThreshold) {
          winnerId = team2.id;
        }
      }
      
      // Update the winner if one is determined
      if (winnerId) {
        setSelectedWinnerId(winnerId);
        form.setValue("winnerId", winnerId);
      }
    }
  };

  // Record match result mutation using our enhanced API client
  const recordResultMutation = useMutation({
    mutationFn: async (data: MatchResultFormValues) => {
      console.log('[RecordMatchResultDialog][PKL-278651-TOURN-0003.1-API] Recording match result', { matchId, data });
      
      // Clear any previous errors
      setError(null);
      
      const winner = data.winnerId;
      const loser = winner === (team1?.id || 0) ? (team2?.id || 0) : (team1?.id || 0);
      
      // Create result data object using our defined type
      const resultData: MatchResult = {
        winnerId: winner,
        loserId: loser,
        score: data.score,
        notes: data.notes || undefined,
      };
      
      // Use our enhanced API client function
      return recordMatchResult(matchId, resultData);
    },
    onSuccess: (response) => {
      // Framework 5.0 synchronized refresh mechanisms
      console.log('[RecordMatchResultDialog][PKL-278651-TOURN-0015-SYNC] Match result recorded successfully');
      
      // Extract match data and bracket ID from response when available
      const bracketId = typeof response === 'object' && response ? 
        (response.bracketId || response.match?.bracketId) : null;
      
      // First independent refresh mechanism: Granular cache invalidation
      // Invalidate all bracket-related queries with specific patterns
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          if (!queryKey) return false;
          
          // Deep inspection of query keys to ensure all cached data is properly refreshed
          if (Array.isArray(queryKey)) {
            // Check for bracket-specific formats
            if (queryKey[0] && queryKey[0].toString().startsWith('bracket-')) {
              return true;
            }
            
            // Check for API endpoint formats
            if (queryKey[0] && 
                (queryKey[0].toString().includes('/brackets') || 
                 queryKey[0].toString().includes('/tournaments'))) {
              return true;
            }
            
            // Check if this is specifically about our match
            if (queryKey[0] && queryKey[0].toString().includes('/matches') && 
                queryKey[1] && queryKey[1].toString() === matchId.toString()) {
              return true;
            }
          } else {
            // Legacy string-based query keys
            return queryKey.toString().includes('/brackets') || 
                   queryKey.toString().includes(`match-${matchId}`);
          }
          
          return false;
        }
      });
      
      // Second independent refresh mechanism: Direct bracket cache invalidation
      if (bracketId) {
        console.log(`[PKL-278651-TOURN-0015-SYNC] Directly invalidating cache for bracket ${bracketId}`);
        queryClient.invalidateQueries({ queryKey: [`bracket-${bracketId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/brackets', bracketId] });
      }
      
      // Third independent refresh mechanism: Event-based notification
      // Notify all components listening for match result changes
      const eventData = {
        matchId,
        timestamp: Date.now(),
        team1Id: team1?.id,
        team2Id: team2?.id,
        bracketId
      };
      
      // Send notification through tournament change context
      tournamentChanges.notifySpecificChange('match_result_recorded', bracketId, eventData);
      
      // Fourth mechanism: UI feedback
      toast({
        title: "Match result recorded",
        description: "The match result has been recorded successfully",
      });
      
      // Fifth mechanism: Delayed secondary notification to handle race conditions
      setTimeout(() => {
        console.log(`[PKL-278651-TOURN-0015-SYNC] Sending delayed secondary notification for match ${matchId}`);
        tournamentChanges.notifySpecificChange('match_result_recorded', bracketId, {
          ...eventData,
          timestamp: Date.now(),
          isDelayedNotification: true
        });
      }, 300);
      
      // Clean up and notify parent
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error("[RecordMatchResultDialog][PKL-278651-TOURN-0003.1-API] Error recording match result:", error);
      
      // Handle typed errors
      if ((error as TournamentError)?.code) {
        const tournamentError = error as TournamentError;
        let errorMessage = "There was an error recording the match result.";
        
        switch (tournamentError.code) {
          case TournamentErrorCode.MATCH_NOT_FOUND:
            errorMessage = "Match not found. It may have been deleted.";
            break;
          case TournamentErrorCode.MATCH_ALREADY_COMPLETED:
            errorMessage = "This match has already been completed. You cannot modify the result.";
            break;
          case TournamentErrorCode.INVALID_TEAMS:
            errorMessage = "Invalid team selection. Please make sure both teams are assigned.";
            break;
          case TournamentErrorCode.VALIDATION_ERROR:
            errorMessage = "Invalid match data. Please check your input and try again.";
            break;
          default:
            errorMessage = tournamentError.message || "Unknown error occurred.";
        }
        
        setError(errorMessage);
        
        toast({
          title: "Error recording match result",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Generic error handling
        setError("There was an error recording the match result. Please try again.");
        
        toast({
          title: "Error recording match result",
          description: "There was an error recording the match result. Please try again.",
          variant: "destructive",
        });
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  const onSubmit = (data: MatchResultFormValues) => {
    if (!team1 || !team2) {
      setError("Both teams must be assigned before recording a result");
      toast({
        title: "Error",
        description: "Both teams must be assigned before recording a result",
        variant: "destructive",
      });
      return;
    }

    // Validate winner is selected
    if (!data.winnerId) {
      // Check if a winner can be determined from the score
      const team1Score = scoreData.team1Score;
      const team2Score = scoreData.team2Score;
      
      if (team1Score > team2Score && team1Score >= 21 && (team1Score - team2Score) >= 2) {
        // Team 1 has won based on score
        form.setValue("winnerId", team1.id);
        data.winnerId = team1.id;
      } else if (team2Score > team1Score && team2Score >= 21 && (team2Score - team1Score) >= 2) {
        // Team 2 has won based on score
        form.setValue("winnerId", team2.id);
        data.winnerId = team2.id;
      } else {
        setError("Please select a winner or enter a valid winning score");
        toast({
          title: "Error",
          description: "Please select a winner or enter a valid winning score",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    recordResultMutation.mutate(data);
  };

  // Enhanced check for team assignments with detailed logging
  console.log(`[RecordMatchResultDialog][PKL-278651-TOURN-0003.1-API] Checking team assignments for match ${matchId}:`, {
    team1,
    team2
  });
  
  // Check for missing teams or missing team IDs
  const team1Missing = !team1 || team1.id === undefined || team1.id === null;
  const team2Missing = !team2 || team2.id === undefined || team2.id === null;
  
  if (team1Missing || team2Missing) {
    // Log detailed information about the issue
    console.error(`[RecordMatchResultDialog][PKL-278651-TOURN-0003.1-API] Cannot record match result - team assignments incomplete:`, {
      matchId,
      team1Missing,
      team2Missing,
      team1: team1 || 'null',
      team2: team2 || 'null'
    });
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Match Result</DialogTitle>
            <DialogDescription>
              Both teams must be assigned to this match before recording a result.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Record Match Result</DialogTitle>
          <DialogDescription>
            Enter the match result between {team1.teamName} and {team2.teamName}.
            <span className="block mt-1 text-xs text-primary">Use visual score input to easily record the final score</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Visual Score Input */}
            <div className="mb-4">
              <FormLabel className="mb-2 block">Match Score</FormLabel>
              <TournamentMatchScoreInput
                value={scoreData}
                onChange={handleScoreChange}
                team1Name={team1.teamName}
                team2Name={team2.teamName}
                team1Id={team1.id}
                team2Id={team2.id}
                onWinnerSelected={handleWinnerSelection}
                pointsToWin={21}
              />
            </div>
            
            {/* Hidden form fields to hold the data */}
            <div className="hidden">
              <FormField
                control={form.control}
                name="winnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />
  
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Result"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}