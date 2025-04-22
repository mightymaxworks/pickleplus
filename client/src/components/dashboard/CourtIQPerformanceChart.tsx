/**
 * CourtIQPerformanceChart component
 * PKL-278651-COURT-0005-GRAPH
 * 
 * This component provides a bar chart representation of CourtIQ performance metrics
 * instead of the previous spider chart which was difficult to interpret on smaller screens.
 */

import React from 'react';
import { CourtIQPerformanceData } from '@/hooks/use-courtiq-performance';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface CourtIQPerformanceChartProps {
  data?: CourtIQPerformanceData;
  isLoading: boolean;
  compact?: boolean;
}

export const CourtIQPerformanceChart = ({ 
  data, 
  isLoading, 
  compact = false 
}: CourtIQPerformanceChartProps) => {
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  // No data state
  if (!data || !data.dimensions) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>No performance data available yet.</p>
        <p className="text-xs mt-1">Record more matches to see your metrics.</p>
      </div>
    );
  }
  
  // Define performance dimensions to show
  const dimensions = [
    { key: 'technique', label: 'Technique', color: 'bg-purple-500' },
    { key: 'strategy', label: 'Strategy', color: 'bg-indigo-500' },
    { key: 'consistency', label: 'Consistency', color: 'bg-blue-500' },
    { key: 'focus', label: 'Focus', color: 'bg-cyan-500' },
  ];
  
  // Only show these in non-compact mode
  const extraDimensions = !compact ? [
    { key: 'power', label: 'Power', color: 'bg-amber-500' },
    { key: 'speed', label: 'Speed', color: 'bg-emerald-500' },
  ] : [];
  
  const allDimensions = [...dimensions, ...extraDimensions];
  
  return (
    <div className="space-y-3">
      {allDimensions.map((dim) => {
        const score = data.dimensions?.[dim.key as keyof typeof data.dimensions]?.score || 0;
        const percentage = (score / 10) * 100;
        
        return (
          <div key={dim.key} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span>{dim.label}</span>
              <span className="font-medium">{score}/10</span>
            </div>
            <Progress value={percentage} className={`h-2 ${dim.color}`} />
          </div>
        );
      })}
    </div>
  );
};

export default CourtIQPerformanceChart;