import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { tournamentApi } from "@/lib/apiClient";
import { TournamentCard } from "@/components/TournamentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Tournament, UserTournament } from "@/types";

export default function Tournaments() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, setLocation]);
  
  // Fetch all tournaments
  const { 
    data: allTournaments,
    isLoading: allTournamentsLoading
  } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
    enabled: isAuthenticated,
  });
  
  // Fetch user tournaments
  const { 
    data: userTournaments,
    isLoading: userTournamentsLoading
  } = useQuery<UserTournament[]>({
    queryKey: ["/api/user/tournaments"],
    enabled: isAuthenticated,
  });
  
  const handleRegisterClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setRegisterDialogOpen(true);
  };
  
  const handleRegisterSubmit = async () => {
    if (!selectedTournament) return;
    
    setIsRegistering(true);
    
    try {
      await tournamentApi.registerForTournament(
        selectedTournament.id, 
        selectedDivision || undefined
      );
      
      // Invalidate tournaments queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/tournaments"] });
      
      toast({
        title: "Registration successful",
        description: `You have been registered for ${selectedTournament.name}`,
      });
      
      setRegisterDialogOpen(false);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error registering for this tournament",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  // Filter out tournaments the user is already registered for
  const availableTournaments = allTournaments?.filter(tournament => {
    return !userTournaments?.some(
      userTournament => userTournament.tournament.id === tournament.id
    );
  });
  
  // Separate upcoming and past tournaments
  const upcomingRegistrations = userTournaments?.filter(
    ut => new Date(ut.tournament.startDate) >= new Date()
  );
  
  const pastRegistrations = userTournaments?.filter(
    ut => new Date(ut.tournament.startDate) < new Date()
  );
  
  const isLoading = allTournamentsLoading || userTournamentsLoading;

  return (
    <div className="tournaments-view pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 font-product-sans">Tournaments</h2>
        <p className="text-gray-500">Check out upcoming tournaments and manage your registrations</p>
      </div>
      
      {/* Registered Tournaments Section */}
      {userTournaments && userTournaments.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold mb-4 font-product-sans">Your Tournaments</h3>
          
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <>
              {upcomingRegistrations && upcomingRegistrations.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 text-gray-500">Upcoming</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingRegistrations.map(({ tournament, registration }) => (
                      <TournamentCard 
                        key={tournament.id} 
                        tournament={tournament} 
                        registration={registration}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {pastRegistrations && pastRegistrations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-500">Past</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastRegistrations.map(({ tournament, registration }) => (
                      <TournamentCard 
                        key={tournament.id} 
                        tournament={tournament} 
                        registration={registration}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Available Tournaments Section */}
      <div>
        <h3 className="font-bold mb-4 font-product-sans">Available Tournaments</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(2).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : availableTournaments && availableTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTournaments.map(tournament => (
              <TournamentCard 
                key={tournament.id} 
                tournament={tournament}
                onRegister={() => handleRegisterClick(tournament)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No available tournaments at the moment</p>
        )}
      </div>
      
      {/* Registration Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tournament Registration</DialogTitle>
            <DialogDescription>
              Register for {selectedTournament?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Select Division</h4>
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mixed Doubles 3.0">Mixed Doubles 3.0</SelectItem>
                  <SelectItem value="Mixed Doubles 3.5">Mixed Doubles 3.5</SelectItem>
                  <SelectItem value="Mixed Doubles 4.0">Mixed Doubles 4.0</SelectItem>
                  <SelectItem value="Men's Doubles 3.0">Men's Doubles 3.0</SelectItem>
                  <SelectItem value="Men's Doubles 3.5">Men's Doubles 3.5</SelectItem>
                  <SelectItem value="Men's Doubles 4.0">Men's Doubles 4.0</SelectItem>
                  <SelectItem value="Women's Doubles 3.0">Women's Doubles 3.0</SelectItem>
                  <SelectItem value="Women's Doubles 3.5">Women's Doubles 3.5</SelectItem>
                  <SelectItem value="Women's Doubles 4.0">Women's Doubles 4.0</SelectItem>
                  <SelectItem value="Singles Open">Singles Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-2">
              <h4 className="text-sm font-medium mb-1">Tournament Details</h4>
              <p className="text-sm text-gray-500">
                <span className="material-icons text-sm align-text-top mr-1">event</span>
                {selectedTournament && new Date(selectedTournament.startDate).toLocaleDateString()}
                {selectedTournament && selectedTournament.startDate !== selectedTournament.endDate && 
                  ` - ${new Date(selectedTournament.endDate).toLocaleDateString()}`
                }
              </p>
              <p className="text-sm text-gray-500">
                <span className="material-icons text-sm align-text-top mr-1">location_on</span>
                {selectedTournament?.location}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRegisterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#FF5722] hover:bg-[#E64A19]"
              onClick={handleRegisterSubmit}
              disabled={isRegistering}
            >
              {isRegistering ? "Registering..." : "Complete Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
