/**
 * PKL-278651-TOURN-0003-MATCH / PKL-278651-TOURN-0003.1-API
 * Record Match Result Dialog Component
 * 
 * Dialog for recording tournament match results, allowing score entry
 * and winner selection for a bracket match.
 * Updated to use enhanced API client with proper error handling.
 */

import { useState } from "react";
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
  const queryClient = useQueryClient();

  // Form setup with validation
  const form = useForm<MatchResultFormValues>({
    resolver: zodResolver(matchResultSchema),
    defaultValues: {
      score: "",
      notes: "",
    },
  });

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
    onSuccess: () => {
      // Framework 5.0: Use predicate-based cache invalidation
      console.log('[RecordMatchResultDialog][PKL-278651-TOURN-0003.1-API] Match result recorded successfully');
      
      // Invalidate all bracket-related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            // Match specific bracket data
            (Array.isArray(queryKey) && queryKey[0].toString().startsWith('bracket-')) ||
            // Tournament brackets list
            (Array.isArray(queryKey) && queryKey[0].toString().includes('/brackets')) ||
            // For backward compatibility
            queryKey.toString().includes('/brackets')
          );
        }
      });
      
      toast({
        title: "Match result recorded",
        description: "The match result has been recorded successfully",
      });
      
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

    setIsSubmitting(true);
    recordResultMutation.mutate(data);
  };

  if (!team1 || !team2) {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Match Result</DialogTitle>
          <DialogDescription>
            Enter the match result between {team1.teamName} and {team2.teamName}.
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
            <FormField
              control={form.control}
              name="winnerId"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Winner</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={team1.id.toString()} id="team1" />
                        <label htmlFor="team1" className="font-medium">
                          {team1.teamName}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={team2.id.toString()} id="team2" />
                        <label htmlFor="team2" className="font-medium">
                          {team2.teamName}
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score (e.g., "21-15, 18-21, 21-19")</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter match score" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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