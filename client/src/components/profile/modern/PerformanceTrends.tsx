/**
 * PKL-278651-PROF-0025-COMP - Performance Trends
 * 
 * A component showing performance comparisons and improvement trends over time.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronRight, 
  BarChart as BarChartIcon,
  ArrowUp,
  ArrowDown,
  Minus,
  Info
} from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface PerformanceTrendsProps {
  user: EnhancedUser;
  className?: string;
}

// Time period options for trends
type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

// Performance stat type
interface PerformanceStat {
  period: string;
  courtIQ: number;
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  consistency: number;
  winRate: number;
}

export default function PerformanceTrends({
  user,
  className = ""
}: PerformanceTrendsProps) {
  // State for time period selection
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  
  // Get performance history
  const { 
    data: performanceHistory = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/stats/performance-history', user.id, timePeriod],
    queryFn: async () => {
      try {
        // Try the primary endpoint
        const response = await apiRequest(
          "GET", 
          `/api/stats/performance-history?userId=${user.id}&period=${timePeriod}`
        );
        
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        
        // Try alternative endpoint if available
        const altResponse = await apiRequest(
          "GET",
          `/api/sage/performance-trends?userId=${user.id}&period=${timePeriod}`
        );
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          return Array.isArray(altData.data) ? altData.data : [];
        }
        
        console.error("Failed to fetch performance history from either endpoint");
        return [];
      } catch (e) {
        console.error("Error fetching performance history:", e);
        return [];
      }
    }
  });
  
  // Calculate trend data - improvement across dimensions
  const trendData = useMemo(() => {
    if (!performanceHistory || performanceHistory.length < 2) return {};
    
    const firstEntry = performanceHistory[performanceHistory.length - 1];
    const latestEntry = performanceHistory[0];
    
    // Calculate change for each dimension
    return {
      courtIQ: {
        value: latestEntry.courtIQ - firstEntry.courtIQ,
        percentage: firstEntry.courtIQ > 0 ? 
          Math.round(((latestEntry.courtIQ - firstEntry.courtIQ) / firstEntry.courtIQ) * 100) : 0
      },
      technical: {
        value: latestEntry.technical - firstEntry.technical,
        percentage: firstEntry.technical > 0 ? 
          Math.round(((latestEntry.technical - firstEntry.technical) / firstEntry.technical) * 100) : 0
      },
      tactical: {
        value: latestEntry.tactical - firstEntry.tactical,
        percentage: firstEntry.tactical > 0 ? 
          Math.round(((latestEntry.tactical - firstEntry.tactical) / firstEntry.tactical) * 100) : 0
      },
      physical: {
        value: latestEntry.physical - firstEntry.physical,
        percentage: firstEntry.physical > 0 ? 
          Math.round(((latestEntry.physical - firstEntry.physical) / firstEntry.physical) * 100) : 0
      },
      mental: {
        value: latestEntry.mental - firstEntry.mental,
        percentage: firstEntry.mental > 0 ? 
          Math.round(((latestEntry.mental - firstEntry.mental) / firstEntry.mental) * 100) : 0
      },
      consistency: {
        value: latestEntry.consistency - firstEntry.consistency,
        percentage: firstEntry.consistency > 0 ? 
          Math.round(((latestEntry.consistency - firstEntry.consistency) / firstEntry.consistency) * 100) : 0
      },
      winRate: {
        value: latestEntry.winRate - firstEntry.winRate,
        percentage: firstEntry.winRate > 0 ? 
          Math.round(((latestEntry.winRate - firstEntry.winRate) / firstEntry.winRate) * 100) : 0
      }
    };
  }, [performanceHistory]);
  
  // Get most improved dimensions
  const mostImprovedDimensions = useMemo(() => {
    if (!trendData || Object.keys(trendData).length === 0) return [];
    
    return Object.entries(trendData)
      .filter(([key]) => key !== 'courtIQ' && key !== 'winRate') // Exclude overall metrics
      .sort(([, a], [, b]) => (b as any).percentage - (a as any).percentage)
      .slice(0, 3)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: (value as any).percentage
      }));
  }, [trendData]);
  
  // Helper to determine trend direction icon
  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-emerald-500" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };
  
  // Format trend value with sign
  const formatTrendValue = (value: number, isPercentage = false) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(isPercentage ? 0 : 2)}${isPercentage ? '%' : ''}`;
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Progress tracking and improvements</CardDescription>
          </div>
          
          {/* Time Period Selector */}
          <div>
            <Select 
              value={timePeriod} 
              onValueChange={(value) => setTimePeriod(value as TimePeriod)}
            >
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading performance trends...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-destructive">Error loading performance data</p>
            <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
          </div>
        ) : performanceHistory.length < 2 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Not enough data to show trends for this period</p>
            <p className="text-sm text-muted-foreground mt-2">Play more matches to see your performance trends</p>
          </div>
        ) : (
          <>
            {/* Overall Rating Trend Chart */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium flex items-center">
                  <BarChartIcon className="h-4 w-4 mr-2 text-primary" />
                  CourtIQ™ Rating Trend
                </h3>
                {trendData.courtIQ && (
                  <Badge 
                    variant="outline" 
                    className={trendData.courtIQ.value > 0 ? 
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' : 
                      trendData.courtIQ.value < 0 ? 
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 
                        ''
                    }
                  >
                    {formatTrendValue(trendData.courtIQ.value)} ({formatTrendValue(trendData.courtIQ.percentage, true)})
                  </Badge>
                )}
              </div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceHistory}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCourtIQ" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: 'var(--muted-foreground)' }}
                      tickLine={{ stroke: 'var(--muted)' }}
                      axisLine={{ stroke: 'var(--muted)' }}
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      tick={{ fill: 'var(--muted-foreground)' }}
                      tickLine={{ stroke: 'var(--muted)' }}
                      axisLine={{ stroke: 'var(--muted)' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px', 
                        color: 'var(--foreground)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="courtIQ" 
                      stroke="var(--primary)" 
                      fillOpacity={1}
                      fill="url(#colorCourtIQ)"
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Dimension Progress */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Dimension Progress
                </h3>
                <div className="group relative">
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  <div className="absolute right-0 w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                    Changes in each CourtIQ dimension rating compared to the beginning of the selected period.
                  </div>
                </div>
              </div>
              
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Technical",
                        value: trendData.technical?.value || 0,
                        percentage: trendData.technical?.percentage || 0,
                      },
                      {
                        name: "Tactical",
                        value: trendData.tactical?.value || 0,
                        percentage: trendData.tactical?.percentage || 0,
                      },
                      {
                        name: "Physical",
                        value: trendData.physical?.value || 0,
                        percentage: trendData.physical?.percentage || 0,
                      },
                      {
                        name: "Mental",
                        value: trendData.mental?.value || 0,
                        percentage: trendData.mental?.percentage || 0,
                      },
                      {
                        name: "Consistency",
                        value: trendData.consistency?.value || 0,
                        percentage: trendData.consistency?.percentage || 0,
                      }
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      type="number"
                      domain={[-1, 1]} 
                      tick={{ fill: 'var(--muted-foreground)' }}
                      tickLine={{ stroke: 'var(--muted)' }}
                      axisLine={{ stroke: 'var(--muted)' }}
                    />
                    <YAxis 
                      dataKey="name"
                      type="category"
                      tick={{ fill: 'var(--muted-foreground)' }}
                      tickLine={{ stroke: 'var(--muted)' }}
                      axisLine={{ stroke: 'var(--muted)' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px', 
                        color: 'var(--foreground)'
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value > 0 ? '+' : ''}${value.toFixed(2)} (${props.payload.percentage > 0 ? '+' : ''}${props.payload.percentage}%)`,
                        name
                      ]}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={(data) => data.value >= 0 ? 'var(--emerald-500)' : 'var(--red-500)'}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Most Improved Dimensions */}
            {mostImprovedDimensions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Medal className="h-4 w-4 mr-2 text-amber-500" />
                  Most Improved Areas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mostImprovedDimensions.map((dimension, index) => (
                    <motion.div
                      key={dimension.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-muted/50 p-3 rounded-lg text-center"
                    >
                      <div className="text-lg font-bold text-emerald-500 flex items-center justify-center">
                        {formatTrendValue(dimension.value, true)}
                        <ArrowUp className="h-4 w-4 ml-1" />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{dimension.name}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Win Rate Trend */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                  Win Rate Trend
                </h3>
                {trendData.winRate && (
                  <Badge 
                    variant="outline" 
                    className={trendData.winRate.value > 0 ? 
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' : 
                      trendData.winRate.value < 0 ? 
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 
                        ''
                    }
                  >
                    {formatTrendValue(trendData.winRate.value, true)}
                  </Badge>
                )}
              </div>
              
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceHistory}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: 'var(--muted-foreground)' }}
                      tickLine={{ stroke: 'var(--muted)' }}
                      axisLine={{ stroke: 'var(--muted)' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: 'var(--muted-foreground)' }}
                      tickLine={{ stroke: 'var(--muted)' }}
                      axisLine={{ stroke: 'var(--muted)' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px', 
                        color: 'var(--foreground)'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Win Rate']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="winRate" 
                      stroke="var(--amber-500)" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'var(--amber-500)' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <span>View Detailed Analytics</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}