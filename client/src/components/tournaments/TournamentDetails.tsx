import { Tournament } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface TournamentDetailsProps {
  tournament: Tournament;
  isRegistered: boolean;
  onCheckin: () => void;
}

const TournamentDetails = ({ tournament, isRegistered, onCheckin }: TournamentDetailsProps) => {
  const { toast } = useToast();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleRegister = async () => {
    try {
      await apiRequest("POST", `/api/tournaments/${tournament.id}/register`, {});
      
      toast({
        title: "Registration Successful",
        description: `You have registered for ${tournament.name}`,
      });
      
      // Invalidate tournaments cache
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments/user'] });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for tournament",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Card className="bg-white shadow-sm overflow-hidden">
        <div className="h-48 bg-secondary relative">
          {tournament.imageUrl ? (
            <div className="w-full h-full bg-secondary"></div>
          ) : (
            <div className="w-full h-full bg-secondary opacity-70 flex items-center justify-center text-white">
              <i className="fas fa-trophy text-7xl"></i>
            </div>
          )}
          <div className={`absolute top-4 right-4 ${isRegistered ? 'bg-primary' : 'bg-gray-500'} text-white text-sm font-bold px-3 py-1 rounded-full`}>
            {isRegistered ? 'REGISTERED' : tournament.status.toUpperCase()}
          </div>
        </div>
        
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Tournament Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-8 text-primary">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-gray-500">{tournament.location}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 text-primary">
                    <i className="fas fa-calendar"></i>
                  </div>
                  <div>
                    <div className="font-medium">Dates</div>
                    <div className="text-gray-500">
                      {formatDate(tournament.startDate)}
                      {tournament.endDate !== tournament.startDate && 
                        ` - ${formatDate(tournament.endDate)}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 text-primary">
                    <i className="fas fa-signal"></i>
                  </div>
                  <div>
                    <div className="font-medium">Skill Level</div>
                    <div className="text-gray-500">{tournament.skillLevel}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 text-primary">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div>
                    <div className="font-medium">Status</div>
                    <div className="text-gray-500">{tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Registration</h3>
              
              {isRegistered ? (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <div className="flex items-center text-accent">
                      <i className="fas fa-check-circle text-xl mr-2"></i>
                      <span className="font-medium">You are registered for this tournament</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 mb-4">
                    Please check in when you arrive at the tournament location by scanning the tournament QR code or using the button below.
                  </p>
                  
                  <Button className="w-full bg-primary" onClick={onCheckin}>
                    <i className="fas fa-qrcode mr-2"></i>
                    Check-in to Tournament
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-4">
                    Register now to participate in this tournament. Registration is open until the tournament starts.
                  </p>
                  
                  <Button className="w-full bg-primary" onClick={handleRegister}>
                    <i className="fas fa-user-plus mr-2"></i>
                    Register Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentDetails;
