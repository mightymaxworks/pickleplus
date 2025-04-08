import React from 'react';
import { Progress } from '@/components/ui/progress';

export interface XPProgressBarProps {
  currentXP: number;
  level: number;
  nextLevelXP: number; 
  previousLevelXP: number;
}

export default function XPProgressBar({ 
  currentXP, 
  level, 
  nextLevelXP, 
  previousLevelXP 
}: XPProgressBarProps) {
  const currentLevelXP = currentXP - previousLevelXP;
  const levelXPRange = nextLevelXP - previousLevelXP;
  const progressPercentage = Math.min(Math.round((currentLevelXP / levelXPRange) * 100), 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <div className="font-medium">Level {level}</div>
        <div className="text-muted-foreground">{currentLevelXP} / {levelXPRange} XP</div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <div>Level {level}</div>
        <div>Level {level + 1}</div>
      </div>
    </div>
  );
}