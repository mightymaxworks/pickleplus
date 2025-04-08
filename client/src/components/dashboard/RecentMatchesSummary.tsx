import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronUp, Activity, Calendar, Users, Clock, Award, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface RecentMatchesSummaryProps {
  userId: number;
}

export default function RecentMatchesSummary({ userId }: RecentMatchesSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [, navigate] = useLocation();
  
  // Query recent matches
  const { data: recentMatches, isLoading } = useQuery({
    queryKey: ["/api/match/recent", { userId }],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/match/recent?userId=${userId}&limit=5`);
        if (!res.ok) throw new Error("Failed to fetch recent matches");
        return await res.json();
      } catch (error) {
        console.error("Error fetching recent matches:", error);
        return [];
      }
    },
  });
  
  const navigateToMatches = () => {
    navigate("/matches");
  };
  
  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'border-primary/20' : ''}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Recent Matches
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
          <div className="text-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <div className="text-sm text-gray-500 mt-2">Loading recent matches...</div>
          </div>
        ) : recentMatches && recentMatches.length > 0 ? (
          <div className="space-y-3">
            {recentMatches.slice(0, isExpanded ? 5 : 3).map((match: any, index: number) => (
              <MatchCard 
                key={index} 
                match={match} 
                currentUserId={userId} 
                showDetails={isExpanded}
              />
            ))}
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToMatches}
                className="w-full text-sm"
              >
                View All Matches
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-4">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-700">No Matches Yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">Record your first match to see it here</p>
            <Button 
              onClick={() => navigate("/record-match")} 
              className="bg-primary hover:bg-primary/90"
            >
              Record First Match
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MatchCardProps {
  match: any;
  currentUserId: number;
  showDetails: boolean;
}

function MatchCard({ match, currentUserId, showDetails }: MatchCardProps) {
  // Determine if the current user won the match
  const isWinner = match.winnerId === currentUserId;
  
  // Calculate the user's team and opponent team
  const userTeam = [match.playerOneId, match.playerOnePartnerId].includes(currentUserId)
    ? { 
        players: [match.playerOneId, match.playerOnePartnerId].filter(Boolean),
        score: match.scorePlayerOne,
      }
    : { 
        players: [match.playerTwoId, match.playerTwoPartnerId].filter(Boolean),
        score: match.scorePlayerTwo,
      };
  
  const opponentTeam = [match.playerOneId, match.playerOnePartnerId].includes(currentUserId)
    ? { 
        players: [match.playerTwoId, match.playerTwoPartnerId].filter(Boolean),
        score: match.scorePlayerTwo,
      }
    : { 
        players: [match.playerOneId, match.playerOnePartnerId].filter(Boolean),
        score: match.scorePlayerOne,
      };
  
  // Format match date
  const matchDate = new Date(match.matchDate);
  const formattedDate = matchDate.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  });
  
  // Determine opponent name(s)
  const opponentName = opponentTeam.players.length > 1 
    ? `${match.playerNames[opponentTeam.players[0]] || 'Opponent'} & ${match.playerNames[opponentTeam.players[1]] || 'Partner'}` 
    : match.playerNames[opponentTeam.players[0]] || 'Opponent';
  
  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${isWinner ? 'border-green-200' : 'border-red-200'}`}>
      <div className={`flex items-center p-3 ${isWinner ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isWinner ? 'bg-green-500' : 'bg-red-500'}`}>
          {isWinner ? 'W' : 'L'}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="font-medium text-sm">vs. {opponentName}</div>
          <div className="text-xs text-gray-600 flex items-center">
            <Calendar size={12} className="mr-1" />
            {formattedDate}
          </div>
        </div>
        
        <div className="text-right">
          <div className={`font-bold ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
            {userTeam.score}-{opponentTeam.score}
          </div>
          <div className="text-xs text-gray-500">
            {match.formatType === 'singles' ? 'Singles' : 'Doubles'}
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <Users size={12} className="text-gray-500 mr-1" />
              <span>{match.formatType === 'singles' ? 'Singles' : 'Doubles'}</span>
            </div>
            
            <div className="flex items-center">
              <Trophy size={12} className="text-gray-500 mr-1" />
              <span>{match.matchType || 'Casual'}</span>
            </div>
            
            <div className="flex items-center">
              <Award size={12} className="text-gray-500 mr-1" />
              <span>+{match.xpAwarded || 0} XP</span>
            </div>
            
            {match.location && (
              <div className="flex items-center col-span-2">
                <MapPin size={12} className="text-gray-500 mr-1" />
                <span className="truncate">{match.location}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Clock size={12} className="text-gray-500 mr-1" />
              <span>{matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}