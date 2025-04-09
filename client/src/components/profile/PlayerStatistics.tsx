import { User } from "../../types";
import { EnhancedUser } from "../../types/enhanced-user";
import { BarChart, Dumbbell, Medal, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PlayerStatisticsProps {
  user: EnhancedUser;
}

export default function PlayerStatistics({ user }: PlayerStatisticsProps) {
  // Calculate win rate if data is available
  const winRate = user.totalMatches > 0 
    ? Math.round((user.matchesWon / user.totalMatches) * 100) 
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center">
          <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold">{user.totalMatches || 0}</div>
          <div className="text-sm text-muted-foreground">Total Matches</div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center">
          <Medal className="h-8 w-8 text-green-500 mb-2" />
          <div className="text-2xl font-bold">{user.matchesWon || 0}</div>
          <div className="text-sm text-muted-foreground">Matches Won</div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center">
          <BarChart className="h-8 w-8 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{winRate}%</div>
          <div className="text-sm text-muted-foreground">Win Rate</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-1">Experience Points (XP)</div>
          <div className="flex justify-between text-sm mb-1">
            <span>Level {user.level}</span>
            <span>{user.xp} XP</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        
        <div>
          <div className="text-sm font-medium mb-1">Court Points</div>
          <div className="flex justify-between text-sm mb-1">
            <span>Ranking Points</span>
            <span>{user.rankingPoints || 0} CP</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        
        {user.totalMatches > 0 ? (
          <div className="space-y-3">
            <div className="bg-muted/30 rounded-md p-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">Match vs. OpponentName</div>
                <div className="text-sm text-green-600 font-medium">Win</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                2 days ago · Singles · 11-7, 11-9
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-md p-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">Tournament: Summer Slam</div>
                <div className="text-sm text-amber-600 font-medium">Quarter-Finals</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                1 week ago · Doubles · 3rd Place
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No match activity yet</p>
            <p className="text-sm mt-1">Play your first match to start building your statistics!</p>
          </div>
        )}
      </div>
    </div>
  );
}