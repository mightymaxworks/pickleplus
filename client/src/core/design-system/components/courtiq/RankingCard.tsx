/**
 * RankingCard Component
 * 
 * A card displaying a player's ranking points information from the CourtIQ™ system.
 * This measures competitive achievement through ranking points earned in matches and tournaments.
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { useRankingHistory } from '@/core/design-system/hooks/useRankingData';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/date';

// Define ranking tier levels - these would typically come from the API
const RANKING_TIERS = [
  { name: "Elite", minPoints: 1000, color: "#FFD700" },
  { name: "Premier", minPoints: 750, color: "#9C27B0" },
  { name: "Advanced", minPoints: 500, color: "#3F51B5" },
  { name: "Intermediate", minPoints: 250, color: "#4CAF50" },
  { name: "Beginner", minPoints: 0, color: "#2196F3" },
];

interface RankingCardProps {
  className?: string;
  userId?: number;
}

export function RankingCard({ className, userId }: RankingCardProps) {
  const { isLoading, error, rankingHistory } = useRankingHistory(userId);
  const [currentRanking, setCurrentRanking] = useState(0);
  const [tier, setTier] = useState(RANKING_TIERS[RANKING_TIERS.length - 1]);
  const [nextTier, setNextTier] = useState(RANKING_TIERS[RANKING_TIERS.length - 2]);

  useEffect(() => {
    if (rankingHistory && rankingHistory.length > 0) {
      // Get the latest ranking
      const latestRanking = rankingHistory[rankingHistory.length - 1].newRanking;
      setCurrentRanking(latestRanking);

      // Find the current tier
      const currentTier = [...RANKING_TIERS].reverse().find(t => latestRanking >= t.minPoints);
      if (currentTier) {
        setTier(currentTier);
        
        // Find the next tier
        const currentTierIndex = RANKING_TIERS.findIndex(t => t.name === currentTier.name);
        if (currentTierIndex > 0) {
          setNextTier(RANKING_TIERS[currentTierIndex - 1]);
        }
      }
    }
  }, [rankingHistory]);

  // Calculate progress to next tier
  const calculateProgress = () => {
    if (tier.name === RANKING_TIERS[0].name) {
      return 100; // Already at highest tier
    }
    
    const pointsNeeded = nextTier.minPoints - tier.minPoints;
    const pointsEarned = currentRanking - tier.minPoints;
    return Math.min(Math.round((pointsEarned / pointsNeeded) * 100), 100);
  };

  if (isLoading) {
    return <RankingCardSkeleton className={className} />;
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle>Ranking Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Error loading ranking data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Ranking Points
          </span>
          <Badge
            variant="outline"
            className="rounded-md text-xs px-2 py-1"
            style={{ borderColor: tier.color, color: tier.color }}
          >
            {tier.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current points */}
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{currentRanking}</span>
            <span className="text-xs text-muted-foreground">Total ranking points</span>
          </div>

          {/* Progress to next tier */}
          {tier.name !== RANKING_TIERS[0].name && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{tier.name}</span>
                <span>{nextTier.name}</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{tier.minPoints}</span>
                <span>{nextTier.minPoints}</span>
              </div>
            </div>
          )}

          {/* Recent history */}
          <div className="pt-2">
            <div className="text-sm font-medium flex items-center gap-1 mb-2">
              <Calendar className="h-4 w-4" />
              <span>Recent Activity</span>
            </div>
            <div className="space-y-1">
              {rankingHistory && rankingHistory.length > 0 ? (
                rankingHistory.slice(-3).reverse().map((item, index) => (
                  <div key={index} className="text-sm flex justify-between items-center py-1 border-b border-dashed last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-xs">{item.reason}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(new Date(item.changeDate))}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`${item.newRanking > item.oldRanking ? 'text-green-500' : 'text-muted-foreground'} text-sm font-medium`}>
                        {item.newRanking > item.oldRanking ? '+ ' : ''}
                        {item.newRanking - item.oldRanking}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-2">
                  No recent ranking activity
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RankingCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-12 w-24" />
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}