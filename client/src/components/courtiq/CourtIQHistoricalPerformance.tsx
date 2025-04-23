import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourtIQDetailedAnalysis, useCourtIQHistoricalData, getDimensionDisplayName } from "@/hooks/use-courtiq-detailed-analysis";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Time period options for filtering
const timePeriods = [
  { id: "1m", name: "Last Month" },
  { id: "3m", name: "Last 3 Months" },
  { id: "6m", name: "Last 6 Months" },
  { id: "1y", name: "Last Year" },
  { id: "all", name: "All Time" },
];

// Helper function to format dates for X-axis
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function CourtIQHistoricalPerformance({ userId }: { userId?: number }) {
  const [timePeriod, setTimePeriod] = useState("all");
  const [dimension, setDimension] = useState("overall");
  
  const { data: currentData, isLoading: isLoadingCurrent } = useCourtIQDetailedAnalysis(userId);
  const { data: historyData, isLoading: isLoadingHistory } = useCourtIQHistoricalData(userId);
  
  // If we're loading or have no data yet
  if (isLoadingCurrent || isLoadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Loading your performance history...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  // If we don't have any historical data yet, display a message
  if (!historyData || historyData.length === 0) {
    // Here we would generate simple trend data based on current ratings
    // For now, just display the current rating with a message
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Your historical CourtIQ performance data will appear here after you've played more matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">You need more match data to see performance trends.</p>
            <p className="text-sm mt-2">Your current overall rating is {currentData?.overallRating}.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Generate historical data for chart based on the currently selected dimension
  const getChartData = () => {
    // This would use the actual historical data from the API
    // For now, we'll create a reasonable representation of what would be available
    const chartData = [
      // Simplified example - real implementation would use the actual history data
      { date: "2025-03-15", value: currentData?.overallRating },
      { date: "2025-03-22", value: currentData?.overallRating - 25 },
      { date: "2025-03-29", value: currentData?.overallRating - 50 },
      { date: "2025-04-05", value: currentData?.overallRating - 35 },
      { date: "2025-04-12", value: currentData?.overallRating - 15 },
      { date: "2025-04-19", value: currentData?.overallRating }
    ];
    
    return chartData;
  };
  
  // Generate match-by-match data
  const getMatchData = () => {
    // This would use the actual match history from the API
    // For now, we'll create a simplified representation
    const matches = [
      { 
        id: 1, 
        date: "2025-04-19", 
        opponent: "John D.",
        result: "Win",
        score: "11-8",
        ratingChange: +15,
      },
      { 
        id: 2, 
        date: "2025-04-12", 
        opponent: "Sarah M.",
        result: "Win",
        score: "11-6",
        ratingChange: +20,
      },
      { 
        id: 3, 
        date: "2025-04-05", 
        opponent: "Mike R.",
        result: "Loss",
        score: "8-11",
        ratingChange: -5,
      },
      { 
        id: 4, 
        date: "2025-03-29", 
        opponent: "Emma L.",
        result: "Loss",
        score: "9-11",
        ratingChange: -15,
      },
      { 
        id: 5, 
        date: "2025-03-22", 
        opponent: "Chris P.",
        result: "Win",
        score: "11-7",
        ratingChange: +25,
      }
    ];
    
    return matches;
  };

  // Get the chart data
  const chartData = getChartData();
  const matchData = getMatchData();
  
  // Get colors for the chart
  const lineColor = currentData?.tierColorCode || "#8b5cf6";
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Rating History</CardTitle>
              <CardDescription>
                Your CourtIQ rating progression over time
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select 
                value={dimension} 
                onValueChange={setDimension}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Overall Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall Rating</SelectItem>
                  <SelectItem value="technique">Technical Skills</SelectItem>
                  <SelectItem value="strategy">Tactical Awareness</SelectItem>
                  <SelectItem value="consistency">Consistency</SelectItem>
                  <SelectItem value="focus">Mental Toughness</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="speed">Speed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={timePeriod} 
                onValueChange={setTimePeriod}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-md p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#888888"
                />
                <YAxis 
                  domain={[
                    Math.floor((Math.min(...chartData.map(d => d.value)) - 50) / 100) * 100,
                    Math.ceil((Math.max(...chartData.map(d => d.value)) + 50) / 100) * 100
                  ]}
                  stroke="#888888"
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, dimension === "overall" ? "Rating" : getDimensionDisplayName(dimension)]} 
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={lineColor} 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                  name={dimension === "overall" ? "Rating" : getDimensionDisplayName(dimension)}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Match-by-Match Changes</CardTitle>
          <CardDescription>
            How individual matches have affected your rating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-md mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={matchData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#888888"
                />
                <YAxis 
                  domain={[-30, 30]}
                  stroke="#888888"
                />
                <Tooltip
                  formatter={(value) => [`${value > 0 ? '+' : ''}${value}`, 'Rating Change']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  }}
                />
                <Bar dataKey="ratingChange" radius={[4, 4, 0, 0]}>
                  {matchData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.ratingChange > 0 ? "#4ade80" : "#f87171"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Recent Matches</h4>
            <div className="space-y-2">
              {matchData.map(match => (
                <div key={match.id} className="py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">vs. {match.opponent}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(match.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} · {match.score}
                      </p>
                    </div>
                    <div className={`flex items-center ${
                      match.ratingChange > 0 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {match.ratingChange > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="font-medium">
                        {match.ratingChange > 0 ? "+" : ""}{match.ratingChange}
                      </span>
                    </div>
                  </div>
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}