/**
 * PKL-278651-PROF-0023-TRENDS - Performance Trends Chart
 * 
 * This component visualizes the player's performance trends over time,
 * showing improvements in CourtIQ dimensions and other metrics.
 * 
 * Part of Sprint 4 - Engagement & Discovery
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { type CourtIQDimension } from "@/services/DataCalculationService";

// Map of dimension codes to display names
const DIMENSION_DISPLAY_NAMES: Record<CourtIQDimension, string> = {
  'TECH': 'Technical',
  'TACT': 'Tactical',
  'PHYS': 'Physical',
  'MENT': 'Mental',
  'CONS': 'Consistency'
};

// Map of dimension codes to colors
const DIMENSION_COLORS: Record<CourtIQDimension, string> = {
  'TECH': '#FF5722', // primary orange
  'TACT': '#2196F3', // blue
  'PHYS': '#4CAF50', // green
  'MENT': '#9C27B0', // purple
  'CONS': '#FFC107'  // amber
};

// Define the data structure for a performance record
export interface PerformanceRecord {
  date: string; // ISO date string
  // CourtIQ dimension ratings at that point in time
  TECH: number;
  TACT: number;
  PHYS: number;
  MENT: number;
  CONS: number;
  // Overall rating
  overall: number;
  // Any notes or events that happened at this date point
  event?: string;
}

interface PerformanceTrendsChartProps {
  performanceHistory: PerformanceRecord[];
  className?: string;
}

export default function PerformanceTrendsChart({
  performanceHistory,
  className = ""
}: PerformanceTrendsChartProps) {
  // For time range selection (default: last 3 months)
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('3m');
  
  // For dimension selection 
  const [selectedDimensions, setSelectedDimensions] = useState<CourtIQDimension[]>(
    ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS']
  );
  
  // Include overall by default
  const [showOverall, setShowOverall] = useState(true);
  
  // Apply filters to performance data
  const filteredData = performanceHistory
    .filter(record => {
      if (timeRange === 'all') return true;
      
      const recordDate = new Date(record.date);
      const now = new Date();
      const monthsToSubtract = 
        timeRange === '1m' ? 1 : 
        timeRange === '3m' ? 3 : 
        timeRange === '6m' ? 6 : 12;
      
      const compareDate = new Date();
      compareDate.setMonth(now.getMonth() - monthsToSubtract);
      
      return recordDate >= compareDate;
    })
    .map(record => ({
      ...record,
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  
  // Calculate trend percentages for insights
  const calculateTrend = (dimension: CourtIQDimension | 'overall'): number => {
    if (filteredData.length < 2) return 0;
    
    const oldest = filteredData[0][dimension];
    const newest = filteredData[filteredData.length - 1][dimension];
    
    // For overall rating, calculate percentage differently due to larger scale
    if (dimension === 'overall') {
      return (newest - oldest) / oldest * 100;
    }
    
    // For 1-5 scale dimensions, calculate the percentage change
    return (newest - oldest) / 5 * 100;
  };
  
  // Toggle a dimension selection
  const toggleDimension = (dimension: CourtIQDimension) => {
    if (selectedDimensions.includes(dimension)) {
      // Only remove if we'd still have at least one dimension selected
      if (selectedDimensions.length > 1) {
        setSelectedDimensions(selectedDimensions.filter(d => d !== dimension));
      }
    } else {
      setSelectedDimensions([...selectedDimensions, dimension]);
    }
  };
  
  // Get trend direction
  const getTrendIcon = (percentage: number) => {
    if (percentage > 1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage < -1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
  };
  
  // Format the trend percentage for display
  const formatTrendPercentage = (percentage: number): string => {
    if (percentage === 0) return "0%";
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };
  
  // Check if we have enough data to show trends
  const hasEnoughData = filteredData.length >= 2;
  
  // Find most improved dimension
  const getMostImprovedDimension = (): { dimension: CourtIQDimension, percentage: number } | null => {
    if (!hasEnoughData) return null;
    
    const dimensions: CourtIQDimension[] = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'];
    let maxImprovement = -Infinity;
    let bestDimension: CourtIQDimension = 'TECH';
    
    dimensions.forEach(dim => {
      const trend = calculateTrend(dim);
      if (trend > maxImprovement) {
        maxImprovement = trend;
        bestDimension = dim;
      }
    });
    
    return { dimension: bestDimension, percentage: maxImprovement };
  };
  
  const mostImproved = getMostImprovedDimension();
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Performance Trends</CardTitle>
            <CardDescription>Track your CourtIQ™ improvement over time</CardDescription>
          </div>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {hasEnoughData ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="dimensions" 
                  domain={[0, 5]}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  label={{ 
                    value: 'Rating (1-5)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fill: 'var(--muted-foreground)', fontSize: 12 }
                  }}
                />
                {showOverall && (
                  <YAxis 
                    yAxisId="overall" 
                    orientation="right"
                    domain={[500, 3000]}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    label={{ 
                      value: 'Overall Rating', 
                      angle: 90, 
                      position: 'insideRight', 
                      style: { fill: 'var(--muted-foreground)', fontSize: 12 }
                    }}
                  />
                )}
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--foreground)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'overall') return [`${value}`, 'Overall Rating'];
                    return [`${Number(value).toFixed(1)}/5`, DIMENSION_DISPLAY_NAMES[name as CourtIQDimension]];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'overall') return 'Overall Rating';
                    return DIMENSION_DISPLAY_NAMES[value as CourtIQDimension];
                  }}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                
                {/* Render dimension lines */}
                {selectedDimensions.map((dimension) => (
                  <Line
                    key={dimension}
                    type="monotone"
                    dataKey={dimension}
                    stroke={DIMENSION_COLORS[dimension]}
                    yAxisId="dimensions"
                    dot={{ strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                ))}
                
                {/* Overall rating line */}
                {showOverall && (
                  <Line
                    type="monotone"
                    dataKey="overall"
                    stroke="var(--border)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    yAxisId="overall"
                    dot={{ strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] w-full flex flex-col items-center justify-center text-muted-foreground">
            <InfoIcon className="h-12 w-12 mb-2 opacity-20" />
            <p>Not enough performance data available</p>
            <p className="text-sm">Keep playing matches to see your trends</p>
          </div>
        )}
        
        {/* Dimension filters - clickable badges */}
        <div className="flex flex-wrap gap-2 mt-6">
          {(Object.keys(DIMENSION_DISPLAY_NAMES) as CourtIQDimension[]).map((dimension) => (
            <motion.div
              key={dimension}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={selectedDimensions.includes(dimension) ? "default" : "outline"}
                className="cursor-pointer"
                style={{ 
                  backgroundColor: selectedDimensions.includes(dimension) 
                    ? DIMENSION_COLORS[dimension] 
                    : 'transparent',
                  borderColor: DIMENSION_COLORS[dimension],
                  color: selectedDimensions.includes(dimension) 
                    ? 'white' 
                    : DIMENSION_COLORS[dimension]
                }}
                onClick={() => toggleDimension(dimension)}
              >
                {DIMENSION_DISPLAY_NAMES[dimension]}
              </Badge>
            </motion.div>
          ))}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Badge
              variant={showOverall ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setShowOverall(!showOverall)}
            >
              Overall Rating
            </Badge>
          </motion.div>
        </div>
      </CardContent>
      
      {hasEnoughData && (
        <CardFooter className="flex flex-col items-start gap-2 pt-2 border-t">
          <div className="w-full">
            <h4 className="text-sm font-medium mb-2">Performance Insights:</h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Overall trend */}
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Overall:</span>
                <div className="flex items-center">
                  {getTrendIcon(calculateTrend('overall'))}
                  <span className="ml-1">{formatTrendPercentage(calculateTrend('overall'))}</span>
                </div>
              </div>
              
              {/* Most improved dimension */}
              {mostImproved && mostImproved.percentage > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Most Improved:</span>
                  <div className="flex items-center">
                    <span className="ml-1" style={{ color: DIMENSION_COLORS[mostImproved.dimension] }}>
                      {DIMENSION_DISPLAY_NAMES[mostImproved.dimension]}
                    </span>
                    <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}