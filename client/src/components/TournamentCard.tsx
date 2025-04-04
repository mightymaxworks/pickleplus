import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { Tournament, TournamentRegistration } from "@/types";
import { format } from "date-fns";

interface TournamentCardProps {
  tournament: Tournament;
  registration?: TournamentRegistration;
  onRegister?: () => void;
}

export function TournamentCard({ tournament, registration, onRegister }: TournamentCardProps) {
  const [, setLocation] = useLocation();
  
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  const startDate = formatDate(tournament.startDate);
  const endDate = formatDate(tournament.endDate);
  const dateDisplay = startDate === endDate 
    ? startDate 
    : `${startDate} - ${endDate}`;
  
  return (
    <Card className="bg-white rounded-lg overflow-hidden pickle-shadow">
      <div className="h-32 bg-gradient-to-r from-[#2196F3] to-[#FF5722] relative">
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 p-4">
          <h4 className="text-white font-bold">{tournament.name}</h4>
          <div className="flex items-center text-white text-sm">
            <span className="material-icons text-sm mr-1">event</span>
            <span>{dateDisplay}</span>
            <span className="mx-2">•</span>
            <span className="material-icons text-sm mr-1">location_on</span>
            <span>{tournament.location}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {registration ? (
          <div className="flex justify-between mb-3">
            <div>
              <span className="text-sm font-medium">Registration Status</span>
              <div className="flex items-center text-[#4CAF50]">
                <span className="material-icons text-sm mr-1">
                  {registration.checkedIn ? "check_circle" : "pending"}
                </span>
                <span className="text-sm">
                  {registration.checkedIn ? "Checked In" : "Confirmed"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">Division</span>
              <p className="text-sm">{registration.division || "Not specified"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm mb-3">{tournament.description || "Join this exciting tournament!"}</p>
        )}
        
        <Button 
          className="w-full bg-[#FF5722] hover:bg-[#E64A19]"
          onClick={registration ? () => setLocation(`/tournaments/${tournament.id}`) : onRegister}
        >
          {registration ? "View Details" : "Register Now"}
        </Button>
      </div>
    </Card>
  );
}
