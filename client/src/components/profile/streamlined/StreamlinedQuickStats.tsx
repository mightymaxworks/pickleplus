/**
 * PKL-278651-SPUI-0001: Streamlined Quick Stats Component
 * A horizontal scrollable card-based bar showing key player metrics
 */
import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Trophy, Star, TrendingUp } from 'lucide-react';

interface StreamlinedQuickStatsProps {
  user: any;
  className?: string;
}

// Helper function to calculate XP needed for next level
const calculateXpProgress = (currentXp: number, currentLevel: number) => {
  const baseXp = 100;
  const factor = 1.5;
  const xpForNextLevel = Math.floor(baseXp * Math.pow(factor, currentLevel));
  const xpFromLastLevel = Math.floor(baseXp * Math.pow(factor, currentLevel - 1));
  const xpForCurrentLevel = currentXp - xpFromLastLevel;
  const xpNeededForLevel = xpForNextLevel - xpFromLastLevel;
  const percentage = Math.min(100, Math.round((xpForCurrentLevel / xpNeededForLevel) * 100));
  
  return {
    current: xpForCurrentLevel,
    needed: xpNeededForLevel,
    percentage
  };
};

const StreamlinedQuickStats: FC<StreamlinedQuickStatsProps> = ({ user, className = '' }) => {
  const xpProgress = calculateXpProgress(user.xp || 0, user.level || 1);
  
  // Get highest external rating value
  const getHighestExternalRating = () => {
    const ratings = [
      parseFloat(user.duprRating || '0'),
      parseFloat(user.utprRating || '0'),
      parseFloat(user.wprRating || '0')
    ].filter(r => r > 0);
    
    return ratings.length > 0 ? Math.max(...ratings) : 0;
  };
  
  // Get external rating display value
  const externalRating = getHighestExternalRating();
  const displayRating = externalRating > 0 ? externalRating.toFixed(1) : '';
  
  // Use the value for progress bar (assuming max rating is 7.0)
  const ratingValue = externalRating;
  const ratingPercentage = (ratingValue / 7) * 100; // Assuming max rating is 7.0
  
  // Calculate win rate if there are matches played
  const winRate = user.totalMatches ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0;
  
  // Placeholder CourtIQ™ rating (would be fetched from backend)
  const courtIQRating = user.rankingPoints || 0;
  const ratingTier = courtIQRating >= 1800 ? "Elite" : 
                     courtIQRating >= 1500 ? "Advanced" : 
                     courtIQRating >= 1200 ? "Intermediate" : 
                     courtIQRating >= 800 ? "Competitive" : "Beginner";
  
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {/* XP Level Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-sm">XP Level</div>
            <Badge variant="outline" className="text-xs">
              Level {user.level || 1}
            </Badge>
          </div>
          <div className="mb-2">
            <Progress value={xpProgress.percentage} className="h-2" />
          </div>
          <div className="text-xs text-muted-foreground">
            {xpProgress.current} / {xpProgress.needed} XP to Level {(user.level || 1) + 1}
          </div>
        </CardContent>
      </Card>
      
      {/* External Rating Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-sm">External Rating</div>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="mb-2">
            <Progress value={ratingPercentage} className="h-2" />
          </div>
          <div className="text-sm font-semibold flex items-center">
            {displayRating || 'Not set'}
            {user.externalRatingsVerified && (
              <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800">
                Verified
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {user.duprRating && (
              <span className="mr-2">DUPR: {user.duprRating}</span>
            )}
            {user.utprRating && (
              <span className="mr-2">UTPR: {user.utprRating}</span>
            )}
            {user.wprRating && (
              <span>WPR: {user.wprRating}</span>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* CourtIQ Rating Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-sm">CourtIQ™</div>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-sm font-semibold mb-1">
            {courtIQRating} pts
          </div>
          <Badge 
            variant="outline" 
            className={`
              ${ratingTier === 'Elite' ? 'bg-purple-100 text-purple-800' : ''}
              ${ratingTier === 'Advanced' ? 'bg-blue-100 text-blue-800' : ''}
              ${ratingTier === 'Intermediate' ? 'bg-green-100 text-green-800' : ''}
              ${ratingTier === 'Competitive' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${ratingTier === 'Beginner' ? 'bg-gray-100 text-gray-800' : ''}
              text-xs
            `}
          >
            {ratingTier}
          </Badge>
        </CardContent>
      </Card>
      
      {/* Match Stats Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-sm">Match Stats</div>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <div className="text-sm mb-1">
              {user.totalMatches || 0} matches played
            </div>
            <div className="text-sm font-semibold">
              {winRate}% win rate
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamlinedQuickStats;