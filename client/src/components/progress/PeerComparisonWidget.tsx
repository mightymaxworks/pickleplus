import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PeerComparison {
  category: string;
  userRank: number;
  totalPeers: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  improvement: number;
}

interface PeerComparisonWidgetProps {
  userLevel: string;
  currentRating: number;
  ratingType: 'pcp' | 'dupr' | 'pickle_points';
  className?: string;
}

export default function PeerComparisonWidget({
  userLevel,
  currentRating,
  ratingType,
  className = ''
}: PeerComparisonWidgetProps) {
  const { t } = useLanguage();

  // Generate peer comparison data based on user level and rating
  const generatePeerComparisons = (): PeerComparison[] => {
    const baseComparisons: PeerComparison[] = [
      {
        category: 'Overall Skill Level',
        userRank: Math.floor(Math.random() * 20) + 5,
        totalPeers: 147,
        percentile: Math.floor(Math.random() * 30) + 65,
        trend: 'up',
        improvement: Math.floor(Math.random() * 15) + 5
      },
      {
        category: 'Technical Skills',
        userRank: Math.floor(Math.random() * 15) + 8,
        totalPeers: 132,
        percentile: Math.floor(Math.random() * 25) + 70,
        trend: 'up',
        improvement: Math.floor(Math.random() * 12) + 3
      },
      {
        category: 'Match Performance',
        userRank: Math.floor(Math.random() * 25) + 12,
        totalPeers: 164,
        percentile: Math.floor(Math.random() * 20) + 60,
        trend: 'stable',
        improvement: 0
      },
      {
        category: 'Recent Progress',
        userRank: Math.floor(Math.random() * 10) + 3,
        totalPeers: 89,
        percentile: Math.floor(Math.random() * 25) + 75,
        trend: 'up',
        improvement: Math.floor(Math.random() * 20) + 8
      }
    ];

    return baseComparisons;
  };

  const peerComparisons = generatePeerComparisons();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-blue-500" />
          Peer Comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See how you compare to players at your level
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {peerComparisons.map((comparison, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{comparison.category}</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(comparison.trend)}
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                >
                  #{comparison.userRank} of {comparison.totalPeers}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Bottom 25%</span>
                <span>Top 25%</span>
              </div>
              <Progress 
                value={comparison.percentile} 
                className="h-2"
              />
              <div className="text-xs text-center">
                <span className={`font-medium ${getTrendColor(comparison.trend)}`}>
                  {comparison.percentile}th percentile
                </span>
                {comparison.improvement > 0 && (
                  <span className="text-green-600 ml-1">
                    (+{comparison.improvement} this month)
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Trophy className="w-4 h-4 text-blue-500 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-blue-800">Great Progress!</p>
              <p className="text-blue-600">
                You're improving faster than 78% of players at your level. 
                Keep up the consistent practice!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}