/**
 * PKL-278651-XP-0002-UI
 * Discovery Tracker Component
 * 
 * This component displays a user's discovery progress in the platform.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LightbulbIcon } from 'lucide-react';

interface DiscoveryTrackerProps {
  totalDiscoveries: number;
  discoveredCount: number;
  title?: string;
  description?: string;
}

const DiscoveryTracker: React.FC<DiscoveryTrackerProps> = ({
  totalDiscoveries,
  discoveredCount,
  title = 'Platform Discoveries',
  description = 'Explore and find hidden features'
}) => {
  // Calculate percentage
  const percentage = Math.round((discoveredCount / totalDiscoveries) * 100);
  const remaining = totalDiscoveries - discoveredCount;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <LightbulbIcon className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={percentage} className="h-2" />
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">{discoveredCount}</span>
              <span className="text-xs text-muted-foreground"> / {totalDiscoveries} discovered</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {remaining > 0 ? `${remaining} more to find` : 'All discovered!'}
            </span>
          </div>
          
          {percentage >= 50 && percentage < 100 && (
            <p className="text-xs text-blue-600 font-medium">
              You're making great progress!
            </p>
          )}
          
          {percentage === 100 && (
            <p className="text-xs text-green-600 font-medium">
              Congratulations! You've found all discoveries.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoveryTracker;