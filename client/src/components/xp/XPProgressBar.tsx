import React from 'react';
import { Progress } from '@/components/ui/progress';

export interface PointsProgressBarProps {
  currentPoints: number;
  pointsLevel: number;
  nextLevelPoints: number; 
  previousLevelPoints: number;
}

export default function PointsProgressBar({ 
  currentPoints, 
  pointsLevel, 
  nextLevelPoints, 
  previousLevelPoints 
}: PointsProgressBarProps) {
  const currentLevelPoints = currentPoints - previousLevelPoints;
  const levelPointsRange = nextLevelPoints - previousLevelPoints;
  const progressPercentage = Math.min(Math.round((currentLevelPoints / levelPointsRange) * 100), 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <div className="font-medium">Points Level {pointsLevel}</div>
        <div className="text-muted-foreground">{currentLevelPoints} / {levelPointsRange} Dill Dollars</div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <div>Level {pointsLevel}</div>
        <div>Level {pointsLevel + 1}</div>
      </div>
    </div>
  );
}