import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Star, Trophy, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimplifiedPointsDisplayProps {
  isWinner: boolean;
  matchType: 'casual' | 'tournament';
  formatType: 'singles' | 'doubles';
  currentRankingPoints: number;
  currentPicklePoints: number;
  showMotivationalMessage?: boolean;
  className?: string;
}

export function SimplifiedPointsDisplay({
  isWinner,
  matchType,
  formatType,
  currentRankingPoints,
  currentPicklePoints,
  showMotivationalMessage = true,
  className
}: SimplifiedPointsDisplayProps) {
  
  // Simplified calculation for display (doesn't reveal actual algorithm)
  const calculateDisplayPoints = () => {
    let rankingGain = isWinner ? 3 : 1;
    let pickleGain = Math.ceil(rankingGain * 1.5);
    
    // Simple bonus indicators without revealing exact multipliers
    let bonusIndicators: string[] = [];
    
    if (matchType === 'tournament') {
      rankingGain *= 2;
      pickleGain *= 2;
      bonusIndicators.push('Tournament Bonus');
    }
    
    if (formatType === 'doubles') {
      bonusIndicators.push('Teamwork XP');
    }
    
    // Performance tier (simplified)
    let tier = 'Bronze';
    let tierColor = 'bg-amber-100 text-amber-800';
    
    if (rankingGain >= 6) {
      tier = 'Gold';
      tierColor = 'bg-yellow-100 text-yellow-800';
    } else if (rankingGain >= 3) {
      tier = 'Silver';
      tierColor = 'bg-gray-100 text-gray-800';
    }
    
    return {
      rankingGain,
      pickleGain,
      bonusIndicators,
      tier,
      tierColor,
      newRankingTotal: currentRankingPoints + rankingGain,
      newPickleTotal: currentPicklePoints + pickleGain
    };
  };
  
  const getMotivationalMessage = (isWinner: boolean, tier: string) => {
    if (isWinner) {
      const messages = [
        "Outstanding performance! 🏆",
        "Victory achieved! Keep the momentum going! ⚡",
        "Excellent match! Your skills are improving! 🌟",
        "Great win! Tournament ready performance! 🎯"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        "Great effort! Every match builds experience! 💪",
        "Solid performance! Keep practicing! 🎯",
        "Good match! Progress comes with persistence! 🌟",
        "Learning opportunity! You're getting stronger! ⚡"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  };
  
  const points = calculateDisplayPoints();
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isWinner ? (
              <Trophy className="h-5 w-5 text-yellow-500" />
            ) : (
              <Target className="h-5 w-5 text-blue-500" />
            )}
            <span>Match Results</span>
          </div>
          <Badge className={points.tierColor}>
            {points.tier} Performance
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Points Earned Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Ranking</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              +{points.rankingGain}
            </div>
            <div className="text-xs text-blue-700">
              {currentRankingPoints} → {points.newRankingTotal}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Rewards</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              +{points.pickleGain}
            </div>
            <div className="text-xs text-green-700">
              {currentPicklePoints} → {points.newPickleTotal}
            </div>
          </div>
        </div>
        
        {/* Bonus Indicators */}
        {points.bonusIndicators.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center space-x-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Bonuses Applied</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {points.bonusIndicators.map((bonus, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {bonus}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Progress Visualization */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Ranking Progress</span>
              <span className="text-blue-600">+{((points.rankingGain / Math.max(currentRankingPoints, 1)) * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min((points.rankingGain / 10) * 100, 100)} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Reward Progress</span>
              <span className="text-green-600">+{((points.pickleGain / Math.max(currentPicklePoints, 1)) * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min((points.pickleGain / 15) * 100, 100)} 
              className="h-2"
            />
          </div>
        </div>
        
        {/* Motivational Message */}
        {showMotivationalMessage && (
          <div className={cn(
            "p-3 rounded-lg text-sm font-medium text-center",
            isWinner 
              ? "bg-green-100 text-green-800" 
              : "bg-blue-100 text-blue-800"
          )}>
            {getMotivationalMessage(isWinner, points.tier)}
          </div>
        )}
        
        {/* Next Level Hint */}
        <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 text-center">
          <strong>Tip:</strong> {
            matchType === 'casual' 
              ? "Try tournament play for bigger rewards!" 
              : "Keep up the competitive spirit!"
          }
        </div>
      </CardContent>
    </Card>
  );
}

export default SimplifiedPointsDisplay;