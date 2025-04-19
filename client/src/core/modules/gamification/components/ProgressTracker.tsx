/**
 * PKL-278651-XP-0002-UI
 * Progress Tracker Component
 * 
 * This component displays a progress bar for tracking completion towards a goal.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressTrackerProps {
  title: string;
  description?: string;
  currentValue: number;
  maxValue: number;
  indicatorClassName?: string;
  showValues?: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  title,
  description,
  currentValue,
  maxValue,
  indicatorClassName = '',
  showValues = true,
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.round((currentValue / maxValue) * 100), 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={percentage} className={indicatorClassName} />
          
          {showValues && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentValue} / {maxValue}</span>
              <span>{percentage}% complete</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;