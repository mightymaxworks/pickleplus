import { useQuery, useMutation, MutateFunction, UseMutationResult } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type PassportUser = {
  id: number;
  displayName: string;
  passportId: string;
  avatarInitials: string;
  level: number;
  rankingPoints: number;
};

export function usePassportLookup(passportId: string | null) {
  return useQuery<PassportUser, Error>({
    queryKey: ['/api/passport', passportId],
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      if (!id) return null;
      
      const response = await fetch(`/api/passport/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found with this Passport ID");
        }
        throw new Error("Failed to look up user");
      }
      
      return await response.json();
    },
    enabled: !!passportId, // Only run the query if passportId is provided
    retry: false,
  });
}

type CheckInData = {
  tournamentId: number;
  passportId: string;
};

export function usePassportTournamentCheckIn() {
  const { toast } = useToast();
  
  return useMutation<TournamentRegistration, Error, CheckInData>({
    mutationFn: async (data: CheckInData) => {
      // First, get the user ID from the passport
      const userResponse = await fetch(`/api/passport/${data.passportId}`);
      if (!userResponse.ok) {
        throw new Error("User not found with this Passport ID");
      }
      
      const user = await userResponse.json();
      
      // Then check in the user for the tournament
      const checkInResponse = await fetch("/api/tournament-check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          tournamentId: data.tournamentId,
        }),
      });
      
      if (!checkInResponse.ok) {
        if (checkInResponse.status === 404) {
          throw new Error("Registration not found. This player is not registered for this tournament.");
        }
        if (checkInResponse.status === 400) {
          const errorData = await checkInResponse.json();
          throw new Error(errorData.message || "Invalid check-in request");
        }
        throw new Error("Failed to check in player");
      }
      
      return await checkInResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in successful",
        description: "The player has been checked in for the tournament.",
      });
      // Invalidate tournament registrations if needed
      queryClient.invalidateQueries({ queryKey: ['/api/user/tournaments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Add types as needed for your app
type TournamentRegistration = any;