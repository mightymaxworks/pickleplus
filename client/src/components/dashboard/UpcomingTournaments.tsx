import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronUp, Calendar, MapPin, Users, Timer, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface UpcomingTournamentsProps {
  userId: number;
}

export default function UpcomingTournaments({ userId }: UpcomingTournamentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [, navigate] = useLocation();
  
  // Query upcoming tournaments
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["/api/user/tournaments", { userId, status: "upcoming" }],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/user/tournaments?userId=${userId}&status=upcoming`);
        if (!res.ok) throw new Error("Failed to fetch tournaments");
        return await res.json();
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        return [];
      }
    },
  });
  
  const navigateToTournaments = () => {
    navigate("/tournaments");
  };
  
  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'border-yellow-200' : ''}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-yellow-600" />
          Upcoming Events
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-5 w-5 border-2 border-yellow-600 border-t-transparent rounded-full mx-auto"></div>
            <div className="text-sm text-gray-500 mt-2">Loading tournaments...</div>
          </div>
        ) : tournaments && tournaments.length > 0 ? (
          <div className="space-y-4">
            {tournaments.slice(0, isExpanded ? 3 : 2).map((tournament: any, index: number) => (
              <TournamentCard key={index} tournament={tournament} isExpanded={isExpanded} />
            ))}
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToTournaments}
                className="w-full text-sm"
              >
                View All Tournaments
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-base font-medium text-gray-700">No Upcoming Events</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">Register for tournaments to see them here</p>
            <Button 
              onClick={navigateToTournaments}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Browse Tournaments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TournamentCardProps {
  tournament: any;
  isExpanded: boolean;
}

function TournamentCard({ tournament, isExpanded }: TournamentCardProps) {
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);
  const now = new Date();
  
  // Calculate days remaining
  const daysRemaining = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const needsCheckIn = daysRemaining <= 1 && !tournament.checkedIn;
  
  // Format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const dateDisplay = startDate.getTime() === endDate.getTime() 
    ? formatDate(startDate)
    : `${formatDate(startDate)} - ${formatDate(endDate)}`;
  
  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${needsCheckIn ? 'border-yellow-300' : 'border-gray-200'}`}>
      <div className={`p-3 ${needsCheckIn ? 'bg-yellow-50' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="font-medium">{tournament.name}</div>
          {daysRemaining <= 0 ? (
            <div className="text-xs font-medium text-red-600 flex items-center">
              <Timer size={12} className="mr-1" />
              Today!
            </div>
          ) : (
            <div className="text-xs font-medium text-gray-600">
              {daysRemaining} days remaining
            </div>
          )}
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Calendar size={12} className="mr-1" />
          {dateDisplay}
          
          {tournament.location && (
            <span className="flex items-center ml-3">
              <MapPin size={12} className="mr-1" />
              {tournament.location}
            </span>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="flex items-center">
              <Users size={12} className="text-gray-500 mr-1" />
              <span>{tournament.currentParticipants}/{tournament.maxParticipants || '∞'} Players</span>
            </div>
            
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-200 mr-1"></div>
              <span>{tournament.division}</span>
            </div>
          </div>
          
          {tournament.checkedIn ? (
            <div className="bg-green-50 text-green-700 border border-green-200 rounded px-2 py-1 text-xs flex items-center">
              <CheckCircle2 size={12} className="mr-1" />
              Checked In
            </div>
          ) : daysRemaining <= 1 ? (
            <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 rounded px-2 py-1 text-xs flex items-center">
              <AlertTriangle size={12} className="mr-1" />
              Check-in Required Soon
            </div>
          ) : (
            <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-1 text-xs flex items-center">
              <Calendar size={12} className="mr-1" />
              Registration Complete
            </div>
          )}
        </div>
      )}
    </div>
  );
}