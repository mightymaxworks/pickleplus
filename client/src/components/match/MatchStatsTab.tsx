/**
 * PKL-278651-STAT-0001-UI: Match Statistics Tab Component
 * This component provides comprehensive match statistics with visualizations
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  BarChart2, 
  Calendar, 
  Check, 
  Filter, 
  LineChart, 
  PieChart, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  X 
} from "lucide-react";
import { 
  PieChart as RechartPie, 
  Pie, 
  Cell, 
  LineChart as RechartLine, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { getMatchStats } from '@/lib/sdk/matchSDK';
import { Separator } from '@/components/ui/separator';

/**
 * PKL-278651-STAT-0001-UI-01: StatsSummaryCard component
 */
interface StatsSummaryCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatsSummaryCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  isLoading 
}: StatsSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold mb-1">{value}</p>
            {change && (
              <div className="flex items-center text-xs">
                {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
                {trend === 'down' && <TrendingUp className="h-3 w-3 mr-1 rotate-180 text-red-500" />}
                <span className={
                  trend === 'up' 
                    ? 'text-green-500' 
                    : trend === 'down' 
                      ? 'text-red-500' 
                      : 'text-muted-foreground'
                }>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="bg-primary/10 p-2 rounded-md">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * PKL-278651-STAT-0001-UI-02: StatFilter component
 */
interface StatFilterProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  matchType: string;
  onMatchTypeChange: (type: string) => void;
  formatType: string;
  onFormatTypeChange: (format: string) => void;
  onRefresh: () => void;
}

function StatFilter({
  timeRange,
  onTimeRangeChange,
  matchType,
  onMatchTypeChange,
  formatType,
  onFormatTypeChange,
  onRefresh
}: StatFilterProps) {
  return (
    <div className="bg-muted/50 p-3 rounded-lg mb-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1.5">Time Range</p>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium mb-1.5">Match Type</p>
          <Select value={matchType} onValueChange={onMatchTypeChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select match type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="competitive">Competitive</SelectItem>
              <SelectItem value="tournament">Tournament</SelectItem>
              <SelectItem value="league">League</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium mb-1.5">Format</p>
          <Select value={formatType} onValueChange={onFormatTypeChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="singles">Singles</SelectItem>
              <SelectItem value="doubles">Doubles</SelectItem>
              <SelectItem value="mixed">Mixed Doubles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-full md:w-auto"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * PKL-278651-STAT-0001-UI-03: EmptyStats component
 */
function EmptyStats() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center">
        <div className="mx-auto bg-muted rounded-full h-12 w-12 flex items-center justify-center mb-4">
          <BarChart2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Match Data Available</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Play and record more matches to see your statistics. We need at least 3 matches to generate meaningful statistics.
        </p>
        <Button>Record a Match</Button>
      </CardContent>
    </Card>
  );
}

/**
 * PKL-278651-STAT-0001-UI-04: WinLossChart component
 */
function WinLossChart({ stats, isLoading }: { stats: any, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
    );
  }
  
  if (!stats || !stats.totalMatches) {
    return <EmptyStats />;
  }
  
  const data = [
    { name: 'Wins', value: stats.matchesWon },
    { name: 'Losses', value: stats.matchesLost },
  ];
  
  const COLORS = ['#4ade80', '#f87171'];
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </RechartPie>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * PKL-278651-STAT-0001-UI-05: PerformanceTrendChart component
 */
function PerformanceTrendChart({ stats, isLoading }: { stats: any, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  if (!stats || !stats.performanceTrend || stats.performanceTrend.length === 0) {
    return <EmptyStats />;
  }
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartLine
          data={stats.performanceTrend}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="winRate"
            stroke="#4ade80"
            activeDot={{ r: 8 }}
            name="Win Rate %"
          />
          <Line type="monotone" dataKey="avgScore" stroke="#60a5fa" name="Avg Score" />
        </RechartLine>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * PKL-278651-STAT-0001-UI-06: FormatPerformanceChart component
 */
function FormatPerformanceChart({ stats, isLoading }: { stats: any, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  if (!stats || !stats.formatPerformance || stats.formatPerformance.length === 0) {
    return <EmptyStats />;
  }
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={stats.formatPerformance}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="format" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="wins" name="Wins" fill="#4ade80" />
          <Bar dataKey="losses" name="Losses" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * PKL-278651-STAT-0001-UI-07: OpponentAnalysisChart component
 */
function OpponentAnalysisChart({ stats, isLoading }: { stats: any, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  if (!stats || !stats.opponentAnalysis || stats.opponentAnalysis.length === 0) {
    return <EmptyStats />;
  }
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.opponentAnalysis}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis />
          <Radar
            name="Win %"
            dataKey="winRate"
            stroke="#4ade80"
            fill="#4ade80"
            fillOpacity={0.6}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * PKL-278651-STAT-0001: Main MatchStatsTab component
 */
export default function MatchStatsTab() {
  const { user } = useAuth();
  
  // Filter state
  const [timeRange, setTimeRange] = useState('90days');
  const [matchType, setMatchType] = useState('all');
  const [formatType, setFormatType] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch match stats with filters
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['matchStats', user?.id, timeRange, matchType, formatType],
    queryFn: () => getMatchStats(user?.id, {
      timeRange,
      matchType: matchType === 'all' ? undefined : matchType as 'casual' | 'competitive' | 'tournament' | 'league' | undefined,
      formatType: formatType === 'all' ? undefined : formatType as 'singles' | 'doubles' | 'mixed' | undefined
    }),
    staleTime: 60000, // 1 minute
  });
  
  // Handle filter changes
  const handleRefresh = () => {
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <StatFilter
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          matchType={matchType}
          onMatchTypeChange={setMatchType}
          formatType={formatType}
          onFormatTypeChange={setFormatType}
          onRefresh={handleRefresh}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsSummaryCard
              key={i}
              title=""
              value=""
              icon={<></>}
              isLoading={true}
            />
          ))}
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Win/Loss Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <WinLossChart stats={null} isLoading={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // If no match stats available
  if (!stats || stats.totalMatches === 0) {
    return (
      <div className="space-y-4">
        <StatFilter
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          matchType={matchType}
          onMatchTypeChange={setMatchType}
          formatType={formatType}
          onFormatTypeChange={setFormatType}
          onRefresh={handleRefresh}
        />
        
        <EmptyStats />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* PKL-278651-STAT-0001-UI-02: Stat Filters */}
      <StatFilter
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        matchType={matchType}
        onMatchTypeChange={setMatchType}
        formatType={formatType}
        onFormatTypeChange={setFormatType}
        onRefresh={handleRefresh}
      />
      
      {/* PKL-278651-STAT-0001-UI-01: Stat Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsSummaryCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          change={stats.winRateChange !== undefined ? `${stats.winRateChange > 0 ? '+' : ''}${stats.winRateChange}%` : undefined}
          trend={stats.winRateChange !== undefined ? (stats.winRateChange > 0 ? 'up' : stats.winRateChange < 0 ? 'down' : 'neutral') : 'neutral'}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        
        <StatsSummaryCard
          title="Total Matches"
          value={stats.totalMatches}
          change={stats.lastMatchDate ? `Last one ${formatDistanceToNow(new Date(stats.lastMatchDate), { addSuffix: true })}` : 'No recent matches'}
          icon={<Activity className="h-5 w-5 text-primary" />}
        />
        
        <StatsSummaryCard
          title="Win Streak"
          value={stats.currentWinStreak}
          change={`Best: ${stats.bestWinStreak}`}
          trend={stats.currentWinStreak > 0 ? 'up' : 'neutral'}
          icon={<BarChart2 className="h-5 w-5 text-primary" />}
        />
        
        <StatsSummaryCard
          title="Avg Score"
          value={stats.avgScore}
          change={stats.avgScoreChange !== undefined ? `${stats.avgScoreChange > 0 ? '+' : ''}${stats.avgScoreChange}` : undefined}
          trend={stats.avgScoreChange !== undefined ? (stats.avgScoreChange > 0 ? 'up' : stats.avgScoreChange < 0 ? 'down' : 'neutral') : 'neutral'}
          icon={<LineChart className="h-5 w-5 text-primary" />}
        />
      </div>
      
      {/* PKL-278651-STAT-0001-UI-08: Tabbed Statistics */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="opponents">Opponents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Win/Loss Ratio</CardTitle>
                <CardDescription>
                  Your overall performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WinLossChart stats={stats} isLoading={false} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Performance</CardTitle>
                <CardDescription>
                  Your performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceTrendChart stats={stats} isLoading={false} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>
                Key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Singles Win Rate</div>
                  <div className="text-2xl font-bold mt-1">{stats.singlesWinRate || 0}%</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Doubles Win Rate</div>
                  <div className="text-2xl font-bold mt-1">{stats.doublesWinRate || 0}%</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Tournament Win Rate</div>
                  <div className="text-2xl font-bold mt-1">{stats.tournamentWinRate || 0}%</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Most Played Location</div>
                  <div className="text-2xl font-bold mt-1">{stats.mostPlayedLocation || 'N/A'}</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Favorite Opponent</div>
                  <div className="text-2xl font-bold mt-1">{stats.favoriteOpponent || 'N/A'}</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Best Score</div>
                  <div className="text-2xl font-bold mt-1">{stats.bestScore || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Your progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceTrendChart stats={stats} isLoading={false} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>
                How your scores are distributed across matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.scoreDistribution || []}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Frequency" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Format Performance</CardTitle>
              <CardDescription>
                Your performance across different game formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormatPerformanceChart stats={stats} isLoading={false} />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Singles Details</CardTitle>
                <CardDescription>
                  Your singles match statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matches Played</span>
                    <span className="font-medium">{stats.singlesMatches || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wins</span>
                    <span className="font-medium">{stats.singlesWins || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Losses</span>
                    <span className="font-medium">{stats.singlesLosses || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-medium">{stats.singlesWinRate || 0}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Score</span>
                    <span className="font-medium">{stats.singlesAvgScore || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Doubles Details</CardTitle>
                <CardDescription>
                  Your doubles match statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matches Played</span>
                    <span className="font-medium">{stats.doublesMatches || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wins</span>
                    <span className="font-medium">{stats.doublesWins || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Losses</span>
                    <span className="font-medium">{stats.doublesLosses || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-medium">{stats.doublesWinRate || 0}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Score</span>
                    <span className="font-medium">{stats.doublesAvgScore || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="opponents" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Opponent Analysis</CardTitle>
              <CardDescription>
                Your performance against opponents of different skill levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpponentAnalysisChart stats={stats} isLoading={false} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Top Opponents</CardTitle>
              <CardDescription>
                Your most frequent opponents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {stats.topOpponents && stats.topOpponents.length > 0 ? (
                    stats.topOpponents.map((opponent: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold">{opponent.initials}</span>
                          </div>
                          <div>
                            <div className="font-medium">{opponent.name}</div>
                            <div className="text-xs text-muted-foreground">{opponent.matches} matches</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={opponent.winRate >= 50 ? "default" : "outline"} className="text-xs">
                            {opponent.winRate}% win rate
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No opponent data available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}