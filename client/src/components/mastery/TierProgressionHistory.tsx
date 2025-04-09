/**
 * TierProgressionHistory component
 * Displays a player's tier progression history in a timeline format
 * 
 * Sprint: PKL-278651-RATE-0004-MADV-UI
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTierProgressions, formatTierProgression } from '@/hooks/use-tier-progressions';
import { 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Settings,
  Medal,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Map reason to icon component
const reasonIconMap = {
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'calendar': Calendar,
  'settings': Settings,
  'medal': Medal,
  'refresh-cw': RefreshCw
};

const TierProgressionHistory: React.FC = () => {
  const { data: progressions, isLoading, error } = useTierProgressions();
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tier History</CardTitle>
          <CardDescription>Your journey through the Mastery Paths</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error || !progressions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tier History</CardTitle>
          <CardDescription>Your journey through the Mastery Paths</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-500 rounded-md">
            Unable to load your tier history. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (progressions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tier History</CardTitle>
          <CardDescription>Your journey through the Mastery Paths</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            <p>No tier changes recorded yet.</p>
            <p className="text-sm mt-2">Play matches to progress through the tiers!</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get formatted progression data
  const formattedProgressions = progressions.map(progression => {
    const { text, color, icon } = formatTierProgression(progression);
    const IconComponent = reasonIconMap[icon as keyof typeof reasonIconMap];
    const date = new Date(progression.createdAt);
    
    return {
      ...progression,
      formattedText: text,
      formattedColor: color,
      formattedIcon: icon,
      IconComponent,
      timeAgo: formatDistanceToNow(date, { addSuffix: true })
    };
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tier History</CardTitle>
        <CardDescription>Your journey through the Mastery Paths</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline connecting dots */}
          <div className="absolute top-0 bottom-0 left-5 w-px bg-gray-200 z-0"></div>
          
          {/* Timeline items */}
          <div className="space-y-6 relative z-10">
            {formattedProgressions.map((progression) => (
              <div key={progression.id} className="flex gap-4">
                {/* Icon bubble */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${progression.formattedColor.replace('text-', 'bg-').replace('500', '100')} ${progression.formattedColor}`}>
                  {progression.IconComponent && <progression.IconComponent size={18} />}
                </div>
                
                {/* Content */}
                <div className="space-y-1">
                  <div className="font-medium">{progression.formattedText}</div>
                  <div className="flex gap-2 items-center">
                    <div className="text-xs text-muted-foreground">
                      {progression.timeAgo}
                    </div>
                    {progression.matchId && (
                      <Badge variant="outline" className="text-xs">
                        Match #{progression.matchId}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TierProgressionHistory;