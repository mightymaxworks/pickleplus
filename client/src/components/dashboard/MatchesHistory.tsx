import { Match, User } from "@/lib/types";
import { useState, useEffect } from "react";

interface MatchesHistoryProps {
  matches: Match[];
  currentUser: User;
}

const MatchesHistory = ({ matches, currentUser }: MatchesHistoryProps) => {
  const [matchesWithNames, setMatchesWithNames] = useState<(Match & { userNames: Record<number, string> })[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch the names of all users in the matches
    // For this example, we'll create mock names based on user IDs
    const enhancedMatches = matches.map(match => {
      const playerIds = [...(match.winnerIds as number[]), ...(match.loserIds as number[])];
      const userNames: Record<number, string> = {};
      
      playerIds.forEach(id => {
        if (id === currentUser.id) {
          userNames[id] = "You";
        } else {
          // Mock names based on player IDs
          const firstInitial = String.fromCharCode(65 + (id % 26));
          userNames[id] = `${firstInitial}. ${String.fromCharCode(65 + ((id + 5) % 26))}.`;
        }
      });
      
      return {
        ...match,
        userNames
      };
    });
    
    setMatchesWithNames(enhancedMatches);
  }, [matches, currentUser]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const getTeamNames = (ids: number[], match: Match & { userNames: Record<number, string> }) => {
    return ids.map(id => match.userNames[id]).join(' & ');
  };
  
  const isWinner = (match: Match) => {
    return (match.winnerIds as number[]).includes(currentUser.id);
  };
  
  const getScoreDisplay = (match: Match) => {
    const score = match.scores[0];
    if (!score) return "0 - 0";
    return `${score.team1} - ${score.team2}`;
  };
  
  const getRatingChange = (match: Match) => {
    const ratingChange = (match.ratingChange as Record<string, number>)[currentUser.id];
    if (!ratingChange) return 0;
    return ratingChange;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-gray-900">Recent Matches</h3>
        <a href="#" className="text-secondary text-sm">View All</a>
      </div>
      
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        {matchesWithNames.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No matches played yet. Start playing to see your match history!
          </div>
        ) : (
          matchesWithNames.map((match) => (
            <div key={match.id} className="border-b border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">{match.matchType === 'singles' ? 'Singles Match' : 'Doubles Match'}</div>
                <div className="text-sm text-gray-500">{formatDate(match.matchDate)}</div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center">
                    {match.matchType === 'singles' ? (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs mr-2">
                        <span>{currentUser.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    ) : (
                      <>
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs mr-2">
                          <span>{currentUser.displayName.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs -ml-2">
                          <span>TM</span>
                        </div>
                      </>
                    )}
                    <div className="ml-2 text-gray-900 font-medium">
                      {getTeamNames(
                        (match.winnerIds as number[]).includes(currentUser.id) 
                          ? (match.winnerIds as number[]) 
                          : (match.loserIds as number[]),
                        match
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-center mx-4">
                  <div className="font-bold text-lg text-gray-900">{getScoreDisplay(match)}</div>
                  <div className={`text-xs ${isWinner(match) ? 'text-accent' : 'text-destructive'} font-medium`}>
                    {isWinner(match) ? 'WIN' : 'LOSS'}
                  </div>
                </div>
                
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end">
                    <div className="mr-2 text-gray-900 font-medium">
                      {getTeamNames(
                        (match.winnerIds as number[]).includes(currentUser.id) 
                          ? (match.loserIds as number[]) 
                          : (match.winnerIds as number[]),
                        match
                      )}
                    </div>
                    {match.matchType === 'singles' ? (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                        <span>OP</span>
                      </div>
                    ) : (
                      <>
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                          <span>O1</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs -ml-2">
                          <span>O2</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <div className="text-accent mr-3">
                  <i className="fas fa-plus-circle mr-1"></i>
                  <span>{match.xpEarned} XP</span>
                </div>
                <div className={`${getRatingChange(match) >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                  <i className="fas fa-chart-line mr-1"></i>
                  <span>{getRatingChange(match) >= 0 ? '+' : ''}{getRatingChange(match)} Rating Points</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchesHistory;
