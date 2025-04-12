/**
 * PKL-278651-TOURN-0003-MATCH
 * Record Match Result Dialog Component
 * 
 * Dialog for recording tournament match results, allowing score entry
 * and winner selection for a bracket match
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LoaderCircle } from "lucide-react";

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

// Schema for match result
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
  const queryClient = useQueryClient();

  // Form setup with validation
  const form = useForm<MatchResultFormValues>({
    resolver: zodResolver(matchResultSchema),
    defaultValues: {
      score: "",
      notes: "",
    },
  });

  // Record match result mutation
  const recordResultMutation = useMutation({
    mutationFn: async (data: MatchResultFormValues) => {
      const winner = data.winnerId;
      const loser = winner === (team1?.id || 0) ? (team2?.id || 0) : (team1?.id || 0);
      
      return apiRequest(`/api/brackets/matches/${matchId}/result`, {
        method: "POST",
        body: JSON.stringify({
          winnerId: winner,
          loserId: loser,
          score: data.score,
          notes: data.notes,
        }),
      });
    },
    onSuccess: () => {
      // Invalidate bracket queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/brackets'] });
      toast({
        title: "Match result recorded",
        description: "The match result has been recorded successfully",
      });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error recording match result:", error);
      toast({
        title: "Error recording match result",
        description: "There was an error recording the match result. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  const onSubmit = (data: MatchResultFormValues) => {
    if (!team1 || !team2) {
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