import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordedMatch } from '@/lib/sdk/matchSDK';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, XCircle, Activity, Users } from 'lucide-react';

interface MatchTrendsProps {
  matches?: RecordedMatch[];
  className?: string;
}

export function MatchTrends({ matches = [], className = '' }: MatchTrendsProps) {
  // Calculate win/loss data
  const winLossData = useMemo(() => {
    if (!matches?.length) return [];
    
    // Get current user ID for comparison
    const userId = matches[0]?.players?.[0]?.userId; // Assuming first player is the user
    
    let wins = 0;
    let losses = 0;
    
    matches.forEach(match => {
      const userIsWinner = match.players.some(
        p => p.userId === userId && p.isWinner
      );
      
      if (userIsWinner) {
        wins++;
      } else {
        losses++;
      }
    });
    
    return [
      { name: 'Wins', value: wins, color: '#4CAF50' },
      { name: 'Losses', value: losses, color: '#F44336' }
    ];
  }, [matches]);
  
  // Calculate match type distribution
  const matchTypeData = useMemo(() => {
    if (!matches?.length) return [];
    
    const typeCounts: Record<string, number> = {};
    
    matches.forEach(match => {
      const formatType = match.formatType || 'unknown';
      typeCounts[formatType] = (typeCounts[formatType] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: name === 'singles' ? '#2196F3' : name === 'doubles' ? '#FF9800' : '#9C27B0'
    }));
  }, [matches]);
  
  // Calculate score distribution
  const scoreDistributionData = useMemo(() => {
    if (!matches?.length) return [];
    
    // Get current user ID for comparison
    const userId = matches[0]?.players?.[0]?.userId; // Assuming first player is the user
    
    const pointDifferentials: Record<string, number> = {
      'Close (1-2)': 0,
      'Moderate (3-5)': 0,
      'Decisive (6-10)': 0,
      'Dominant (11+)': 0
    };
    
    matches.forEach(match => {
      const userPlayer = match.players.find(p => p.userId === userId);
      const opponentPlayer = match.players.find(p => p.userId !== userId);
      
      if (!userPlayer || !opponentPlayer) return;
      
      const userScore = Number(userPlayer.score);
      const opponentScore = Number(opponentPlayer.score);
      const differential = Math.abs(userScore - opponentScore);
      
      if (differential <= 2) {
        pointDifferentials['Close (1-2)']++;
      } else if (differential <= 5) {
        pointDifferentials['Moderate (3-5)']++;
      } else if (differential <= 10) {
        pointDifferentials['Decisive (6-10)']++;
      } else {
        pointDifferentials['Dominant (11+)']++;
      }
    });
    
    return Object.entries(pointDifferentials).map(([name, value]) => ({
      name,
      value,
      color: name.includes('Close') ? '#FFC107' : 
             name.includes('Moderate') ? '#03A9F4' : 
             name.includes('Decisive') ? '#9C27B0' : '#FF5722'
    }));
  }, [matches]);
  
  // Calculate recent trend (last 5 matches)
  const recentMatchesData = useMemo(() => {
    if (!matches?.length) return [];
    
    // Get current user ID for comparison
    const userId = matches[0]?.players?.[0]?.userId; // Assuming first player is the user
    
    return matches.slice(0, 5).map((match, index) => {
      const userPlayer = match.players.find(p => p.userId === userId);
      const opponentPlayer = match.players.find(p => p.userId !== userId);
      
      if (!userPlayer || !opponentPlayer) {
        return { name: `Match ${index + 1}`, score: 0, result: 'Unknown' };
      }
      
      const result = userPlayer.isWinner ? 'Win' : 'Loss';
      
      return {
        name: `Match ${index + 1}`,
        score: userPlayer.score,
        result,
        color: result === 'Win' ? '#4CAF50' : '#F44336'
      };
    }).reverse(); // Most recent first
  }, [matches]);
  
  // If no matches available
  if (!matches?.length) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Activity className="h-12 w-12 mb-2 opacity-20" />
            <p>Record matches to see your performance trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="win-loss">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="win-loss" className="flex-1">
              <Trophy className="w-4 h-4 mr-1" /> Win/Loss
            </TabsTrigger>
            <TabsTrigger value="match-types" className="flex-1">
              <Users className="w-4 h-4 mr-1" /> Types
            </TabsTrigger>
            <TabsTrigger value="score-diff" className="flex-1">
              <Activity className="w-4 h-4 mr-1" /> Scores
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="win-loss" className="p-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#4CAF50] rounded-full mr-1" />
                <span className="text-sm">Wins: {winLossData[0]?.value || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#F44336] rounded-full mr-1" />
                <span className="text-sm">Losses: {winLossData[1]?.value || 0}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="match-types" className="p-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={matchTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {matchTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {matchTypeData.map((type, index) => (
                <div key={type.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: type.color }} />
                  <span className="text-sm">{type.name}: {type.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="score-diff" className="p-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scoreDistributionData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {scoreDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-2">
              Score differentials across all matches
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Recent match trends */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Recent Performance</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={recentMatchesData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  labelFormatter={() => 'Match Details'}
                  formatter={(value, name, props) => [
                    `Score: ${value}`, props.payload.result
                  ]} 
                />
                <Bar dataKey="score">
                  {recentMatchesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MatchTrends;