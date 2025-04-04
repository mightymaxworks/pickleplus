import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tournament, User } from "@/lib/types";
import TournamentList from "@/components/tournaments/TournamentList";
import TournamentDetails from "@/components/tournaments/TournamentDetails";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import QRScanner from "@/components/QRScanner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const Tournaments = () => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  // Fetch current user data
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  // Fetch all tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  // Fetch user tournaments
  const { data: userTournaments, isLoading: userTournamentsLoading } = useQuery<{ tournament: Tournament; participant: any }[]>({
    queryKey: ['/api/tournaments/user', user?.id],
    enabled: !!user,
  });

  const selectedTournament = tournaments?.find(t => t.id === selectedTournamentId);

  const handleScanSuccess = async (playerId: string) => {
    setIsScanning(false);

    try {
      // Fetch user by player ID
      const response = await fetch(`/api/users/playerId/${playerId}`);
      
      if (!response.ok) {
        throw new Error("Player not found");
      }
      
      const scannedPlayer = await response.json();
      
      toast({
        title: "Player Found",
        description: `Scanned player: ${scannedPlayer.displayName}`,
      });
      
      // Here you would implement logic to check-in the player to a tournament
      // or add them to your match, etc.
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process QR code",
        variant: "destructive",
      });
    }
  };

  const handleTournamentCheckin = async (tournamentId: number) => {
    try {
      await apiRequest("POST", `/api/tournaments/${tournamentId}/checkin`, {});
      
      toast({
        title: "Success",
        description: "You have been checked in to the tournament",
      });
      
      // Invalidate tournaments cache
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments/user', user?.id] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to check in to tournament",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsScanning(true)}>
            <i className="fas fa-qrcode mr-2"></i>
            Scan QR Code
          </Button>
          <Button className="bg-primary">
            <i className="fas fa-search mr-2"></i>
            Find Tournaments
          </Button>
        </div>
      </div>

      {selectedTournament ? (
        <div>
          <div className="mb-4">
            <Button variant="outline" onClick={() => setSelectedTournamentId(null)}>
              <i className="fas fa-arrow-left mr-2"></i>
              Back to List
            </Button>
          </div>
          <TournamentDetails 
            tournament={selectedTournament} 
            isRegistered={userTournaments?.some(ut => ut.tournament.id === selectedTournament.id)} 
            onCheckin={() => handleTournamentCheckin(selectedTournament.id)}
          />
        </div>
      ) : (
        <Card className="bg-white">
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming Tournaments</TabsTrigger>
              <TabsTrigger value="registered">My Tournaments</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              {tournamentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <TournamentList 
                  tournaments={tournaments || []}
                  userTournaments={userTournaments || []}
                  onSelectTournament={setSelectedTournamentId}
                />
              )}
            </TabsContent>
            <TabsContent value="registered">
              {userTournamentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <TournamentList 
                  tournaments={(userTournaments || []).map(ut => ut.tournament)}
                  userTournaments={userTournaments || []}
                  onSelectTournament={setSelectedTournamentId}
                  registeredOnly
                />
              )}
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {isScanning && <QRScanner onSuccess={handleScanSuccess} onClose={() => setIsScanning(false)} />}
    </div>
  );
};

export default Tournaments;
