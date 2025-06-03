import React from 'react';
import { Progress } from '@/components/ui/progress';

export interface PointsProgressBarProps {
  currentPoints: number;
  targetGoal?: number;
  label?: string;
}

export default function PointsProgressBar({ 
  currentPoints, 
  targetGoal = 10000,
  label = "Pickle Points Progress"
}: PointsProgressBarProps) {
  const progressPercentage = Math.min(Math.round((currentPoints / targetGoal) * 100), 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground">{currentPoints.toLocaleString()} Pickle Points</div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <div>Current: {currentPoints.toLocaleString()}</div>
        <div>Goal: {targetGoal.toLocaleString()}</div>
      </div>
    </div>
  );
}