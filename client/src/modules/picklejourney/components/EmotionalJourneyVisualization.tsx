/**
 * PKL-278651-JOUR-001.3: Emotional Journey Visualization Component
 * 
 * A component that visualizes the user's emotional journey over time,
 * showing patterns and trends in their emotional states.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import React, { useMemo, useState } from 'react';
import { format, subDays, isAfter, isBefore, compareAsc } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useJournalEntry } from '../hooks/useJournalEntry';
import { useEmotionDetection } from '../hooks/useEmotionDetection';
import { EmotionalState, EmotionalDataPoint } from '../types';
import { TrendingUp } from 'lucide-react';

interface EmotionalJourneyVisualizationProps {
  className?: string;
  timeRange?: 'week' | 'month' | 'year';
}

/**
 * Function to convert emotional state to a numeric value for visualization
 */
const emotionalStateToValue = (state: EmotionalState): number => {
  switch (state) {
    case 'frustrated-disappointed': return 1;
    case 'anxious-uncertain': return 2;
    case 'neutral-focused': return 3;
    case 'excited-proud': return 4;
    case 'determined-growth': return 5;
    default: return 3;
  }
};

/**
 * Function to convert numeric value back to emotional state label
 */
const valueToEmotionalStateLabel = (value: number): string => {
  if (value <= 1.5) return 'Frustrated';
  if (value <= 2.5) return 'Anxious';
  if (value <= 3.5) return 'Neutral';
  if (value <= 4.5) return 'Excited';
  return 'Determined';
};

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border p-2 rounded-md shadow-md text-xs">
        <p className="font-bold">{label}</p>
        <p className="text-primary">Emotional State: {valueToEmotionalStateLabel(data.value)}</p>
        <p>Entries: {data.entryCount}</p>
      </div>
    );
  }
  return null;
};

/**
 * Component that visualizes emotional journey over time
 */
export function EmotionalJourneyVisualization({
  className,
  timeRange = 'month'
}: EmotionalJourneyVisualizationProps) {
  const { entries } = useJournalEntry();
  const { detectionHistory } = useEmotionDetection();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>(timeRange);
  
  // Calculate date ranges based on selected time range
  const dateRanges = useMemo(() => {
    const now = new Date();
    return {
      week: subDays(now, 7),
      month: subDays(now, 30),
      year: subDays(now, 365)
    };
  }, []);
  
  // Prepare data for visualization
  const chartData = useMemo(() => {
    const data: Record<string, EmotionalDataPoint> = {};
    const startDate = dateRanges[selectedTimeRange];
    
    // Function to format date correctly based on time range
    const formatDateForKey = (date: Date): string => {
      if (selectedTimeRange === 'week') {
        return format(date, 'eeee');
      } else if (selectedTimeRange === 'month') {
        return format(date, 'MMM d');
      } else {
        return format(date, 'MMM yyyy');
      }
    };
    
    // Initialize data structure with dates
    const now = new Date();
    let currentDate = new Date(startDate);
    while (compareAsc(currentDate, now) <= 0) {
      const formattedDate = formatDateForKey(currentDate);
      data[formattedDate] = {
        date: new Date(currentDate),
        formattedDate,
        value: 0,
        rawValue: null,
        entryCount: 0
      };
      
      // Increment date based on time range
      if (selectedTimeRange === 'week') {
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      } else if (selectedTimeRange === 'month') {
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      } else {
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }
    }
    
    // Process journal entries
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      if (isAfter(entryDate, startDate)) {
        const formattedDate = formatDateForKey(entryDate);
        if (data[formattedDate]) {
          const value = emotionalStateToValue(entry.emotionalState);
          
          if (data[formattedDate].rawValue === null) {
            data[formattedDate].rawValue = value;
            data[formattedDate].value = value;
          } else {
            // Calculate average if multiple entries on same day
            const rawValue = data[formattedDate].rawValue || 0; // Default to 0 if null
            const total = (rawValue * data[formattedDate].entryCount) + value;
            data[formattedDate].entryCount += 1;
            data[formattedDate].rawValue = value; // Store latest value as raw
            data[formattedDate].value = total / data[formattedDate].entryCount;
          }
          
          data[formattedDate].entryCount += 1;
        }
      }
    });
    
    // Process emotion detections for dates without entries
    detectionHistory.forEach(detection => {
      const detectionDate = new Date(detection.timestamp);
      if (isAfter(detectionDate, startDate)) {
        const formattedDate = formatDateForKey(detectionDate);
        
        // Only use detection if there's no journal entry for that date
        if (data[formattedDate] && data[formattedDate].entryCount === 0) {
          const value = emotionalStateToValue(detection.primaryEmotion);
          
          if (data[formattedDate].rawValue === null) {
            data[formattedDate].rawValue = value;
            data[formattedDate].value = value;
          } else {
            // Calculate average if multiple detections on same day
            const rawValue = data[formattedDate].rawValue || 0; // Default to 0 if null
            const total = (rawValue * data[formattedDate].entryCount) + value;
            data[formattedDate].entryCount += 1;
            data[formattedDate].rawValue = value; // Store latest value as raw
            data[formattedDate].value = total / data[formattedDate].entryCount;
          }
        }
      }
    });
    
    // Convert to array and add neutral value for days without entries or detections
    return Object.values(data).map(point => {
      if (point.rawValue === null) {
        return {
          ...point,
          rawValue: 3, // Neutral
          value: 3     // Neutral
        };
      }
      return point;
    });
  }, [entries, detectionHistory, dateRanges, selectedTimeRange]);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="h-5 w-5 mr-2" />
          Your Emotional Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue={selectedTimeRange} 
          onValueChange={(value) => setSelectedTimeRange(value as 'week' | 'month' | 'year')}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="week">7 Days</TabsTrigger>
            <TabsTrigger value="month">30 Days</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    // Simplified display for smaller screens
                    if (selectedTimeRange === 'week') {
                      return value.substring(0, 3); // First 3 letters of day name
                    } else if (selectedTimeRange === 'month') {
                      return value; // Keep day format
                    } else {
                      return value; // Keep month format
                    }
                  }}
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]} 
                  tickFormatter={(value) => valueToEmotionalStateLabel(value).substring(0, 4)}
                  width={50}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={3} stroke="#888" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex justify-between text-xs pt-2">
            <Badge variant="outline" className="text-red-500">Frustrated</Badge>
            <Badge variant="outline" className="text-amber-500">Anxious</Badge>
            <Badge variant="outline" className="text-blue-500">Neutral</Badge>
            <Badge variant="outline" className="text-green-500">Excited</Badge>
            <Badge variant="outline" className="text-purple-500">Determined</Badge>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default EmotionalJourneyVisualization;