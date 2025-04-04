import { Tournament, TournamentParticipant } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface TournamentCardProps {
  tournament: Tournament;
  isRegistered?: boolean;
  userStatus?: string;
}

const TournamentCard = ({ tournament, isRegistered = false, userStatus = "OPEN" }: TournamentCardProps) => {
  const { toast } = useToast();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const handleRegister = async () => {
    try {
      await apiRequest("POST", `/api/tournaments/${tournament.id}/register`, {});
      
      toast({
        title: "Success",
        description: `You have registered for ${tournament.name}`,
        variant: "default",
      });
      
      // Invalidate tournaments cache
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments/user'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register for tournament",
        variant: "destructive",
      });
    }
  };
  
  const handleViewDetails = () => {
    // Navigate to tournament details page
    // This would be implemented in a full app
    toast({
      title: "View Details",
      description: `Viewing details for ${tournament.name}`,
      variant: "default",
    });
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="h-32 bg-secondary relative">
        {tournament.imageUrl ? (
          <div className="w-full h-full bg-secondary"></div>
        ) : (
          <div className="w-full h-full bg-secondary opacity-70 flex items-center justify-center text-white">
            <i className="fas fa-trophy text-5xl"></i>
          </div>
        )}
        <div className={`absolute top-3 right-3 ${isRegistered ? 'bg-primary' : 'bg-gray-500'} text-white text-xs font-bold px-2 py-1 rounded`}>
          {isRegistered ? userStatus : tournament.status.toUpperCase()}
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-bold text-gray-900 mb-1">{tournament.name}</h4>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <i className="fas fa-map-marker-alt mr-1"></i>
          <span>{tournament.location}</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <i className="fas fa-calendar mr-1"></i>
          <span>{formatDate(tournament.startDate)}{tournament.endDate !== tournament.startDate ? ` - ${formatDate(tournament.endDate)}` : ''}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="bg-primary bg-opacity-10 text-primary text-xs font-medium rounded-full px-2 py-1">
            {tournament.skillLevel} Skill Level
          </div>
          
          <button 
            className={`text-sm font-medium ${isRegistered ? 'text-secondary' : 'text-primary'}`}
            onClick={isRegistered ? handleViewDetails : handleRegister}
          >
            {isRegistered ? 'Details' : 'Register'}
            <i className="fas fa-chevron-right ml-1 text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
