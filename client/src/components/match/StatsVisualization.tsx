/**
 * PKL-278651-MATCH-0003-DS: Stats Visualization Component
 * This component provides visualizations for match statistics
 */
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Type definition for match statistics data
interface MatchStatisticsData {
  // General statistics
  totalPoints?: number;
  rallyLengthAvg?: number;
  longestRally?: number;
  
  // Shot statistics
  unforcedErrors?: number;
  winners?: number;
  
  // Point-specific statistics
  netPointsWon?: number;
  netPointsTotal?: number;
  dinkPointsWon?: number;
  dinkPointsTotal?: number;
  servePointsWon?: number;
  servePointsTotal?: number;
  returnPointsWon?: number;
  returnPointsTotal?: number;
  
  // Technical statistics
  thirdShotSuccessRate?: number;
  timeAtNetPct?: number;
}

// Type definition for match details
interface MatchDetails {
  id?: number;
  date?: string;
  formatType?: 'singles' | 'doubles' | 'mixed';
  scoringSystem?: 'traditional' | 'rally';
  pointsToWin?: number;
  players?: Array<{
    userId: number;
    score: string | number;
    isWinner: boolean;
    displayName?: string;
    username?: string;
  }>;
  playerNames?: {
    [userId: number]: {
      displayName: string;
      username: string;
    }
  };
}

interface StatsVisualizationProps {
  statistics: MatchStatisticsData;
  match?: MatchDetails;
  userId?: number;
}

/**
 * Component to visualize match statistics with charts and graphs
 */
export function StatsVisualization({ 
  statistics, 
  match,
  userId 
}: StatsVisualizationProps) {
  // Calculate success rates and derived metrics
  const derivedMetrics = useMemo(() => {
    // Shot effectiveness
    const netPointsRate = statistics.netPointsTotal && statistics.netPointsTotal > 0
      ? (statistics.netPointsWon || 0) / statistics.netPointsTotal * 100
      : 0;
      
    const dinkPointsRate = statistics.dinkPointsTotal && statistics.dinkPointsTotal > 0
      ? (statistics.dinkPointsWon || 0) / statistics.dinkPointsTotal * 100
      : 0;
      
    const servePointsRate = statistics.servePointsTotal && statistics.servePointsTotal > 0
      ? (statistics.servePointsWon || 0) / statistics.servePointsTotal * 100
      : 0;
      
    const returnPointsRate = statistics.returnPointsTotal && statistics.returnPointsTotal > 0
      ? (statistics.returnPointsWon || 0) / statistics.returnPointsTotal * 100
      : 0;
    
    // Winners to errors ratio
    const winnerErrorRatio = (statistics.unforcedErrors || 0) > 0
      ? (statistics.winners || 0) / (statistics.unforcedErrors || 1)
      : (statistics.winners || 0);
      
    return {
      netPointsRate,
      dinkPointsRate,
      servePointsRate,
      returnPointsRate,
      winnerErrorRatio
    };
  }, [statistics]);
  
  // Prepare data for charts
  const shotSuccessData = useMemo(() => {
    return [
      { name: 'Net Play', value: derivedMetrics.netPointsRate },
      { name: 'Dinking', value: derivedMetrics.dinkPointsRate },
      { name: 'Serves', value: derivedMetrics.servePointsRate },
      { name: 'Returns', value: derivedMetrics.returnPointsRate }
    ];
  }, [derivedMetrics]);
  
  const shotDistributionData = useMemo(() => {
    const total = (
      (statistics.netPointsTotal || 0) +
      (statistics.dinkPointsTotal || 0) +
      (statistics.servePointsTotal || 0) +
      (statistics.returnPointsTotal || 0)
    );
    
    if (total === 0) return [];
    
    return [
      { name: 'Net Play', value: (statistics.netPointsTotal || 0) / total * 100 },
      { name: 'Dinking', value: (statistics.dinkPointsTotal || 0) / total * 100 },
      { name: 'Serves', value: (statistics.servePointsTotal || 0) / total * 100 },
      { name: 'Returns', value: (statistics.returnPointsTotal || 0) / total * 100 }
    ];
  }, [statistics]);
  
  const winnerErrorData = useMemo(() => {
    return [
      { name: 'Winners', value: statistics.winners || 0 },
      { name: 'Errors', value: statistics.unforcedErrors || 0 }
    ];
  }, [statistics]);
  
  const skillRadarData = useMemo(() => {
    // Normalize values to 0-100 scale
    return [
      {
        skill: 'Net Play',
        value: derivedMetrics.netPointsRate
      },
      {
        skill: 'Dinking',
        value: derivedMetrics.dinkPointsRate
      },
      {
        skill: 'Serving',
        value: derivedMetrics.servePointsRate
      },
      {
        skill: 'Returns',
        value: derivedMetrics.returnPointsRate
      },
      {
        skill: 'Third Shot',
        value: statistics.thirdShotSuccessRate !== undefined && statistics.thirdShotSuccessRate !== null ? statistics.thirdShotSuccessRate : 0
      },
      {
        skill: 'W/E Ratio',
        value: Math.min(derivedMetrics.winnerErrorRatio * 25, 100) // Scale the ratio (0-4 maps to 0-100)
      }
    ];
  }, [statistics, derivedMetrics]);

  // Check if we have sufficient data to display visualizations
  const hasData = useMemo(() => {
    return (
      statistics && 
      (
        (statistics.netPointsTotal && statistics.netPointsTotal > 0) ||
        (statistics.dinkPointsTotal && statistics.dinkPointsTotal > 0) ||
        (statistics.servePointsTotal && statistics.servePointsTotal > 0) ||
        (statistics.returnPointsTotal && statistics.returnPointsTotal > 0) ||
        (statistics.winners && statistics.winners > 0) ||
        (statistics.unforcedErrors && statistics.unforcedErrors > 0)
      )
    );
  }, [statistics]);

  // If no data, show empty state
  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Statistics</CardTitle>
          <CardDescription>
            No detailed statistics available for this match
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>This match doesn't have detailed statistics recorded.</p>
            {match?.id && (
              <p className="text-sm mt-2">Consider adding statistics to track your performance.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Colors for charts
  const CHART_COLORS = ['#4ade80', '#60a5fa', '#f59e0b', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Shot Success Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Shot Success Rates</CardTitle>
          <CardDescription>
            Success percentage by shot type
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shotSuccessData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} label={{ value: '%', position: 'insideTopLeft', offset: 0 }} />
              <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : (value || '0.0')}%`, 'Success Rate']} />
              <Legend />
              <Bar dataKey="value" name="Success Rate">
                {shotSuccessData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Winners vs Errors */}
        <Card>
          <CardHeader>
            <CardTitle>Winners vs Errors</CardTitle>
            <CardDescription>
              Comparison of winners to unforced errors
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winnerErrorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell key="cell-0" fill="#4ade80" />
                  <Cell key="cell-1" fill="#f43f5e" />
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Skill Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Radar</CardTitle>
            <CardDescription>
              Performance across different skills
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Skill Rating"
                  dataKey="value"
                  stroke="#FF5722"
                  fill="#FF5722"
                  fillOpacity={0.6}
                />
                <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : (value || '0.0')}%`, 'Rating']} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* General Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Match Summary</CardTitle>
          <CardDescription>
            Key statistics from this match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Total Points</div>
              <div className="text-2xl font-bold">{statistics.totalPoints !== undefined && statistics.totalPoints !== null ? statistics.totalPoints : 0}</div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Avg Rally Length</div>
              <div className="text-2xl font-bold">{statistics.rallyLengthAvg !== undefined && statistics.rallyLengthAvg !== null ? statistics.rallyLengthAvg.toFixed(1) : '0.0'}</div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Longest Rally</div>
              <div className="text-2xl font-bold">{statistics.longestRally !== undefined && statistics.longestRally !== null ? statistics.longestRally : 0}</div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Time at Net</div>
              <div className="text-2xl font-bold">{statistics.timeAtNetPct !== undefined && statistics.timeAtNetPct !== null ? statistics.timeAtNetPct : 0}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}