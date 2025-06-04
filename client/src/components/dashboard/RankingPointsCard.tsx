import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface RankingPointsCardProps {
  user: any;
}

export function RankingPointsCard({ user }: RankingPointsCardProps) {
  // Direct API call without complex caching
  const { data: rankingData, isLoading } = useQuery({
    queryKey: ['pcp-ranking-direct', user?.id, Math.random()], // Always fresh
    queryFn: async () => {
      const response = await fetch(`/api/pcp-ranking/${user?.id}`);
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

  // Direct use of API response
  const totalPoints = rankingData?.rankingPoints || 0;
  
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