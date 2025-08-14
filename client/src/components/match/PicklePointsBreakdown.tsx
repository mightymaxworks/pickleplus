import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Star, Trophy, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Player {
  id: number;
  username: string;
  fullName?: string;
  currentPicklePoints?: number;
  ageGroup?: string;
  gender?: string;
  level?: string;
}

interface PicklePointsCalculation {
  rankingPointsEarned: number;
  conversionRate: number;
  picklePointsFromMatch: number;
  bonusPicklePoints?: number;
  totalPicklePoints: number;
  reason: string;
}

interface PicklePointsBreakdownProps {
  player: Player;
  calculation: PicklePointsCalculation;
  matchType: 'casual' | 'tournament';
  formatType: 'singles' | 'doubles';
  isWinner: boolean;
  previousPoints: number;
  className?: string;
  detailed?: boolean;
}

export function PicklePointsBreakdown({
  player,
  calculation,
  matchType,
  formatType,
  isWinner,
  previousPoints,
  className,
  detailed = true
}: PicklePointsBreakdownProps) {
  const newTotal = previousPoints + calculation.totalPicklePoints;
  const percentageIncrease = previousPoints > 0 ? ((calculation.totalPicklePoints / previousPoints) * 100) : 100;
  
  const getAgeGroupDisplay = (ageGroup?: string) => {
    if (!ageGroup) return null;
    const ageMap: Record<string, string> = {
      'under-30': 'Under 30',
      '30-39': '30-39 Age Group',
      '40-49': '40-49 Age Group', 
      '50-59': '50-59 Age Group',
      '60-plus': '60+ Age Group'
    };
    return ageMap[ageGroup] || ageGroup;
  };

  const getLevelDisplay = (level?: string) => {
    if (!level) return null;
    const levelMap: Record<string, { label: string; color: string }> = {
      'beginner': { label: 'Beginner', color: 'bg-green-100 text-green-800' },
      'intermediate': { label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
      'advanced': { label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
      'expert': { label: 'Expert', color: 'bg-orange-100 text-orange-800' },
      'pro': { label: 'Professional', color: 'bg-red-100 text-red-800' }
    };
    return levelMap[level] || { label: level, color: 'bg-gray-100 text-gray-800' };
  };

  if (!detailed) {
    return (
      <div className={cn("flex items-center justify-between p-3 bg-gray-50 rounded-lg", className)}>
        <div>
          <div className="font-semibold text-sm">{player.fullName || player.username}</div>
          <div className="text-xs text-gray-600">{calculation.reason}</div>
        </div>
        <div className="text-right">
          <div className={cn(
            "font-bold text-lg",
            isWinner ? "text-green-600" : "text-blue-600"
          )}>
            +{calculation.totalPicklePoints}
          </div>
          <div className="text-xs text-gray-500">Pickle Points</div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-lg">Points Earned</span>
          </div>
          <Badge variant={isWinner ? "default" : "secondary"} className="flex items-center space-x-1">
            {isWinner ? <Trophy className="h-3 w-3" /> : <Star className="h-3 w-3" />}
            <span>{isWinner ? 'Winner' : 'Participant'}</span>
          </Badge>
        </CardTitle>
        
        <div className="space-y-2">
          <div className="font-semibold">{player.fullName || player.username}</div>
          <div className="flex items-center space-x-2">
            {player.ageGroup && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {getAgeGroupDisplay(player.ageGroup)}
              </Badge>
            )}
            {player.gender && (
              <Badge variant="outline" className="text-xs">
                {player.gender.charAt(0).toUpperCase()}
              </Badge>
            )}
            {player.level && (
              <Badge className={cn("text-xs", getLevelDisplay(player.level)?.color)}>
                {getLevelDisplay(player.level)?.label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Points Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-700">Points Calculation</h4>
          
          <div className="space-y-2">
            {/* Conversion from Ranking Points */}
            <div className="flex justify-between items-center">
              <span className="text-sm">From Ranking Points ({calculation.rankingPointsEarned} × {calculation.conversionRate})</span>
              <span className="font-semibold text-blue-600">+{calculation.picklePointsFromMatch}</span>
            </div>
            
            {/* Activity Bonuses */}
            {calculation.bonusPicklePoints > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Activity Bonuses</span>
                <span className="font-semibold text-green-600">+{calculation.bonusPicklePoints}</span>
              </div>
            )}
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Pickle Points Earned</span>
              <span className="font-bold text-lg text-green-600">+{calculation.totalPicklePoints}</span>
            </div>
          </div>
        </div>

        {/* Points Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Previous Total</span>
            <span>{previousPoints} PP</span>
          </div>
          <Progress value={Math.min((newTotal / 1000) * 100, 100)} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="font-semibold">New Total</span>
            <span className="font-semibold text-green-600">{newTotal} PP</span>
          </div>
          {percentageIncrease > 0 && (
            <div className="text-xs text-gray-500 text-center">
              +{percentageIncrease.toFixed(1)}% increase
            </div>
          )}
        </div>

        {/* Algorithm Reference */}
        <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
          <strong>Pickle Points System:</strong> Based on PICKLE_PLUS_ALGORITHM_DOCUMENT.md
          <br />
          Converted from Ranking Points at 1.5x rate + activity bonuses | Used for equipment discounts & premium access
        </div>
      </CardContent>
    </Card>
  );
}

export default PicklePointsBreakdown;