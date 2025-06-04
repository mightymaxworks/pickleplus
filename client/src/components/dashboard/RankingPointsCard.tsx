import React from 'react';
import { useTotalRankingPoints } from '@/hooks/use-total-ranking-points';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface RankingPointsCardProps {
  user: any;
}

export function RankingPointsCard({ user }: RankingPointsCardProps) {
  const { data: rankingData, isLoading } = useTotalRankingPoints(user?.id);
  
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Use the total calculated by the hook, or fall back to API value
  const totalPoints = rankingData?.totalRankingPoints || rankingData?.rankingPoints || 0;
  
  return (
    <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          PCP Rankings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {totalPoints}
          </div>
          <div className="text-sm opacity-90">Total Ranking Points</div>
        </div>
      </CardContent>
    </Card>
  );
}