import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

// Form schema for match recording
const matchFormSchema = z.object({
  playerOneId: z.number().int().positive(),
  playerTwoId: z.coerce.number().int().positive(), // Coerce ensures string input is converted to number
  playerOneScore: z.coerce.number().int().min(0).max(99), // Handle number inputs as strings
  playerTwoScore: z.coerce.number().int().min(0).max(99), // Handle number inputs as strings
  location: z.string().optional(),
  matchType: z.enum(["casual", "league", "tournament"]).default("casual"),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

interface MatchRecordingFormProps {
  onSuccess?: () => void;
}

export function MatchRecordingForm({ onSuccess }: MatchRecordingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      playerOneId: user?.id || 0,
      playerTwoId: 0,
      playerOneScore: 0,
      playerTwoScore: 0,
      location: "",
      matchType: "casual",
    },
  });

  // Create a mutation for recording a match
  const recordMatchMutation = useMutation({
    mutationFn: async (data: MatchFormValues) => {
      const res = await apiRequest("POST", "/api/matches", data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/user/ranking-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ranking-leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      
      // Show success toast
      toast({
        title: "Match recorded!",
        description: "Your match has been successfully recorded.",
      });
      
      // Reset form
      form.reset({
        playerOneId: user?.id || 0,
        playerTwoId: 0,
        playerOneScore: 0,
        playerTwoScore: 0,
        location: "",
        matchType: "casual",
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error recording match:", error);
      
      toast({
        title: "Error recording match",
        description: "There was an error recording your match. Please try again.",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = async (data: MatchFormValues) => {
    setIsSubmitting(true);
    
    // Ensure playerTwoId is not the same as the current user
    if (data.playerOneId === Number(data.playerTwoId)) {
      toast({
        title: "Invalid opponent",
        description: "You cannot record a match against yourself.",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
      return;
    }
    
    recordMatchMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player One ID (Current User) */}
          <FormField
            control={form.control}
            name="playerOneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Player ID</FormLabel>
                <FormControl>
                  <Input disabled {...field} value={user?.id || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Player Two ID (Opponent) */}
          <FormField
            control={form.control}
            name="playerTwoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opponent's Player ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter opponent's ID"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player One Score */}
          <FormField
            control={form.control}
            name="playerOneScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Score</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    placeholder="Your score"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Player Two Score */}
          <FormField
            control={form.control}
            name="playerTwoScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opponent's Score</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    placeholder="Opponent's score"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Match Type */}
          <FormField
            control={form.control}
            name="matchType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Match Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select match type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="casual">Casual Match</SelectItem>
                    <SelectItem value="league">League Match</SelectItem>
                    <SelectItem value="tournament">Tournament Match</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter match location"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Recording Match..." : "Record Match"}
        </Button>
      </form>
    </Form>
  );
}