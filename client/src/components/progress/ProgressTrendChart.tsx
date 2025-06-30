import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressDataPoint {
  date: string;
  rating: number;
  matches: number;
  milestone?: string;
}

interface ProgressTrendChartProps {
  userLevel: string;
  currentRating: number;
  ratingType: 'pcp' | 'dupr' | 'pickle_points';
  timeRange: '7d' | '30d' | '90d' | '1y';
  className?: string;
}

export default function ProgressTrendChart({
  userLevel,
  currentRating,
  ratingType,
  timeRange = '30d',
  className = ''
}: ProgressTrendChartProps) {
  const { t } = useLanguage();

  // Generate realistic progress data based on user rating and time range
  const generateProgressData = (): ProgressDataPoint[] => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data: ProgressDataPoint[] = [];
    
    const today = new Date();
    let baseRating = Math.max(1.0, currentRating - 0.5); // Start slightly lower
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic progress with some variance
      const progressFactor = (days - i) / days; // 0 to 1
      const variance = (Math.random() - 0.5) * 0.1; // Small random variance
      const trendRating = baseRating + (progressFactor * 0.5) + variance;
      
      // Add milestones at certain points
      let milestone;
      if (i === Math.floor(days * 0.75) && trendRating >= 3.0) {
        milestone = 'Reached 3.0 Rating';
      } else if (i === Math.floor(days * 0.5) && trendRating >= 2.5) {
        milestone = 'Level Up!';
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        rating: Math.max(1.0, Math.min(5.0, trendRating)),
        matches: Math.floor(Math.random() * 5) + 1,
        milestone
      });
    }
    
    return data;
  };

  const progressData = generateProgressData();
  const startRating = progressData[0]?.rating || currentRating;
  const endRating = progressData[progressData.length - 1]?.rating || currentRating;
  const totalImprovement = endRating - startRating;
  const improvementPercentage = ((totalImprovement / startRating) * 100);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeRange === '30d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-sm text-blue-600">
            Rating: {payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Matches: {data.matches}
          </p>
          {data.milestone && (
            <p className="text-sm text-green-600 font-medium">
              🎉 {data.milestone}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          Progress Trend
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Your rating progress over {timeRange}
          </p>
          <div className="flex items-center gap-2">
            {totalImprovement > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <Badge 
              variant={totalImprovement > 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {totalImprovement > 0 ? '+' : ''}{improvementPercentage.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                stroke="#666"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="#8884d8"
                strokeWidth={2}
                fill="url(#ratingGradient)"
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#8884d8', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Starting Rating</p>
            <p className="font-medium text-sm">{startRating.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current Rating</p>
            <p className="font-medium text-sm text-blue-600">{endRating.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Improvement</p>
            <p className={`font-medium text-sm ${totalImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalImprovement > 0 ? '+' : ''}{totalImprovement.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800">Trend Analysis</span>
          </div>
          <p className="text-xs text-blue-600">
            {totalImprovement > 0 
              ? `You're on an upward trend! Your rating has improved by ${totalImprovement.toFixed(2)} points. Keep up the great work!`
              : `Your rating has stabilized. Focus on consistency and technique refinement to continue improving.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}