import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface RankingPointsCardProps {
  user: any;
}

export function RankingPointsCard({ user }: RankingPointsCardProps) {
  // Use new age-division ranking system - determine user's natural age division
  const currentYear = new Date().getFullYear();
  const userAge = user?.yearOfBirth ? currentYear - user.yearOfBirth : 0;
  const ageDivision = userAge >= 35 ? '35plus' : '19plus';
  
  // Direct API call using new age-division system
  const { data: rankingData, isLoading } = useQuery({
    queryKey: ['multi-rankings-position', user?.id, 'singles', ageDivision, 'age-division-v1'], 
    queryFn: async () => {
      const params = new URLSearchParams({
        userId: user?.id?.toString() || '',
        format: 'singles',
        ageDivision: ageDivision
      });
      const response = await fetch(`/api/multi-rankings/position?${params.toString()}`);
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Extract points from new age-division ranking system
  const totalPoints = rankingData?.rankingPoints || 0;
  const status = rankingData?.status;
  const requiredMatches = rankingData?.requiredMatches || 10;
  const currentMatches = rankingData?.matchCount || 0;
  
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
          <div className="text-sm opacity-90">
            {status === 'not_ranked' 
              ? `${ageDivision.toUpperCase()} Division (${currentMatches}/${requiredMatches} matches)`
              : `${ageDivision.toUpperCase()} Division Points`
            }
          </div>
          {status === 'not_ranked' && (
            <div className="mt-2 text-xs opacity-75">
              Need {requiredMatches - currentMatches} more matches to be ranked
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}