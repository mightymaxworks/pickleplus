import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface MixedDoublesRankingDisplayProps {
  menPlayers: Player[];
  womenPlayers: Player[];
  isLoading?: boolean;
}

/**
 * Mixed Doubles Ranking Display Component
 * 
 * Displays gender-separated rankings within the mixed doubles category.
 * Shows both men's and women's mixed doubles rankings in a tabbed interface.
 */
export function MixedDoublesRankingDisplay({ 
  menPlayers, 
  womenPlayers, 
  isLoading = false 
}: MixedDoublesRankingDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Mixed Doubles Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const PlayerRankingCard = ({ player }: { player: Player }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {player.ranking}
        </div>
        <div>
          <div className="font-medium">{player.displayName}</div>
          <div className="text-sm text-gray-500">@{player.username}</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="font-bold text-lg">{player.points}</div>
          <div className="text-sm text-gray-500">points</div>
        </div>
        <div className="text-right">
          <div className="font-medium">{player.matchesPlayed}</div>
          <div className="text-sm text-gray-500">matches</div>
        </div>
        <div className="text-right">
          <Badge variant={player.winRate >= 70 ? "default" : player.winRate >= 50 ? "secondary" : "outline"}>
            {player.winRate.toFixed(1)}%
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Mixed Doubles Rankings
          <Badge variant="outline" className="text-xs">
            Format-Specific Competition
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Gender-separated rankings within mixed doubles category. Men compete against men, women against women.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="men" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="men" className="flex items-center space-x-2">
              <span>Men's Mixed Doubles</span>
              <Badge variant="secondary" className="text-xs">
                {menPlayers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="women" className="flex items-center space-x-2">
              <span>Women's Mixed Doubles</span>
              <Badge variant="secondary" className="text-xs">
                {womenPlayers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="men" className="mt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-500 px-4">
                <span>Player</span>
                <div className="flex space-x-12">
                  <span>Points</span>
                  <span>Matches</span>
                  <span>Win Rate</span>
                </div>
              </div>
              {menPlayers.length > 0 ? (
                menPlayers.map((player) => (
                  <PlayerRankingCard key={player.id} player={player} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No men's mixed doubles rankings yet
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="women" className="mt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-500 px-4">
                <span>Player</span>
                <div className="flex space-x-12">
                  <span>Points</span>
                  <span>Matches</span>
                  <span>Win Rate</span>
                </div>
              </div>
              {womenPlayers.length > 0 ? (
                womenPlayers.map((player) => (
                  <PlayerRankingCard key={player.id} player={player} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No women's mixed doubles rankings yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MixedDoublesRankingDisplay;