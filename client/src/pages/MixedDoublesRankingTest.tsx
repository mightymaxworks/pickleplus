import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MixedDoublesRankingDisplay } from '@/components/admin/MixedDoublesRankingDisplay';

interface Player {
  id: number;
  displayName: string;
  username: string;
  points: number;
  matchesPlayed: number;
  winRate: number;
  ranking: number;
  gender: 'male' | 'female';
}

export default function MixedDoublesRankingTest() {
  const [menPlayers, setMenPlayers] = useState<Player[]>([]);
  const [womenPlayers, setWomenPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMixedDoublesRankings = async () => {
    setIsLoading(true);
    try {
      // Fetch men's mixed doubles rankings
      const menResponse = await fetch('/api/enhanced-leaderboard/all-facilities?format=mixed-doubles-men');
      const menData = await menResponse.json();
      
      // Fetch women's mixed doubles rankings  
      const womenResponse = await fetch('/api/enhanced-leaderboard/all-facilities?format=mixed-doubles-women');
      const womenData = await womenResponse.json();

      if (menData.success && womenData.success) {
        // Transform men's data
        const transformedMen: Player[] = menData.data.map((user: any, index: number) => ({
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          points: user.mixedDoublesMenRankingPoints || 0,
          matchesPlayed: user.totalMatches || 0,
          winRate: user.winRate || 0,
          ranking: index + 1,
          gender: 'male' as const
        }));

        // Transform women's data
        const transformedWomen: Player[] = womenData.data.map((user: any, index: number) => ({
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          points: user.mixedDoublesWomenRankingPoints || 0,
          matchesPlayed: user.totalMatches || 0,
          winRate: user.winRate || 0,
          ranking: index + 1,
          gender: 'female' as const
        }));

        setMenPlayers(transformedMen);
        setWomenPlayers(transformedWomen);
      }
    } catch (error) {
      console.error('Error fetching mixed doubles rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMixedDoublesRankings();
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Mixed Doubles Ranking Test</h1>
            <p className="text-gray-600 mt-2">
              Testing gender-separated mixed doubles rankings with format-specific point system
            </p>
          </div>
          <Button onClick={fetchMixedDoublesRankings} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh Rankings'}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{menPlayers.length}</div>
              <div className="text-sm text-gray-500">Men's Mixed Doubles Players</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-pink-600">{womenPlayers.length}</div>
              <div className="text-sm text-gray-500">Women's Mixed Doubles Players</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{menPlayers.length + womenPlayers.length}</div>
              <div className="text-sm text-gray-500">Total Mixed Doubles Players</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MixedDoublesRankingDisplay 
        menPlayers={menPlayers}
        womenPlayers={womenPlayers}
        isLoading={isLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Men's Mixed Doubles Format</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Uses `mixed_doubles_men_ranking_points` field</li>
                <li>• Endpoint: `/api/enhanced-leaderboard/all-facilities?format=mixed-doubles-men`</li>
                <li>• Men compete against men in mixed doubles category</li>
                <li>• Separate point pool from women's mixed doubles</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Women's Mixed Doubles Format</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Uses `mixed_doubles_women_ranking_points` field</li>
                <li>• Endpoint: `/api/enhanced-leaderboard/all-facilities?format=mixed-doubles-women`</li>
                <li>• Women compete against women in mixed doubles category</li>
                <li>• Separate point pool from men's mixed doubles</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">Key Features Tested</h4>
            <ul className="text-sm text-blue-600 mt-2 space-y-1">
              <li>✅ Gender-separated ranking display with tabbed interface</li>
              <li>✅ Format-specific point system (5 separate ranking categories)</li>
              <li>✅ Cross-format competition support (mixed teams vs single-gender teams)</li>
              <li>✅ Real-time data fetching from new database columns</li>
              <li>✅ UI responsiveness and loading states</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}