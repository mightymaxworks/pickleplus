/**
 * PathsVisualization component
 * Visual representation of all mastery paths and tiers with the player's position
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMasteryTiers } from '@/hooks/use-mastery-tiers';
import { useMasteryTierStatus } from '@/hooks/use-mastery-tier-status';
import { DEFAULT_TIER_COLORS, MasteryPath } from '@shared/mastery-paths';
import { 
  Shield, 
  Award, 
  Crown,
  ChevronRight,
  User
} from 'lucide-react';

// Path to icon mapping
const PathIcon: Record<MasteryPath, React.ElementType> = {
  'Foundation': Shield,
  'Evolution': Award,
  'Pinnacle': Crown
};

interface PathsVisualizationProps {
  compact?: boolean;
}

const PathsVisualization: React.FC<PathsVisualizationProps> = ({ compact = false }) => {
  const { data: allTiers, isLoading: isLoadingTiers } = useMasteryTiers();
  const { data: playerStatus, isLoading: isLoadingStatus } = useMasteryTierStatus();
  
  const isLoading = isLoadingTiers || isLoadingStatus;
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={compact ? "h-full" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <Skeleton className="h-6 w-[180px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[240px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-[120px]" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-12 flex-1 rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error or no data state
  if (!allTiers) {
    return (
      <Card className={compact ? "h-full" : ""}>
        <CardHeader>
          <CardTitle className="text-lg">Mastery Paths</CardTitle>
          <CardDescription>Your journey through the CourtIQ™ tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            <p>Unable to load mastery paths information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Group tiers by path
  const tiersByPath: Record<MasteryPath, typeof allTiers> = {
    Foundation: [],
    Evolution: [],
    Pinnacle: []
  };
  
  allTiers.forEach(tier => {
    if (tiersByPath[tier.path as MasteryPath]) {
      tiersByPath[tier.path as MasteryPath].push(tier);
    }
  });
  
  // Sort tiers within each path by order
  Object.keys(tiersByPath).forEach(path => {
    tiersByPath[path as MasteryPath].sort((a, b) => a.order - b.order);
  });
  
  // All available paths in reverse order (for display from bottom to top)
  const pathsInOrder: MasteryPath[] = ['Pinnacle', 'Evolution', 'Foundation'];
  
  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Mastery Paths</CardTitle>
        <CardDescription>Your journey through the CourtIQ™ tiers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {pathsInOrder.map((path) => {
            const PathIconComponent = PathIcon[path];
            const tiers = tiersByPath[path];
            
            return (
              <div key={path} className="space-y-3">
                <div className="flex items-center gap-2">
                  <PathIconComponent className={`h-5 w-5 ${path === 'Foundation' ? 'text-blue-500' : path === 'Evolution' ? 'text-purple-500' : 'text-amber-500'}`} />
                  <h3 className="font-semibold">{path} Path</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {tiers.map((tier) => {
                    // PKL-278651-RATE-0004-MADV-FIX - Use currentTierName instead of deprecated currentTier property
                    const isCurrentTier = playerStatus && playerStatus.currentTierName === tier.name;
                    const colorHex = tier.colorCode || DEFAULT_TIER_COLORS[tier.name] || '#888888';
                    
                    // Extract RGB from hex for background with transparency
                    const hexToRgb = (hex: string) => {
                      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                      return result 
                        ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 0.1)`
                        : 'rgba(0, 0, 0, 0.1)';
                    };
                    
                    const bgColor = hexToRgb(colorHex);
                    
                    return (
                      <div 
                        key={tier.id}
                        className={`relative p-3 rounded-md text-center ${isCurrentTier ? 'ring-2 ring-offset-2 ring-blue-500' : 'bg-slate-50'}`}
                        style={{ 
                          backgroundColor: isCurrentTier ? bgColor : undefined
                        }}
                      >
                        {isCurrentTier && (
                          <Badge 
                            className="absolute -top-2 -right-2 bg-green-500"
                            style={{ backgroundColor: colorHex }}
                          >
                            <User className="h-3 w-3 mr-1" />
                            You
                          </Badge>
                        )}
                        
                        <div className="font-medium text-sm" style={{ color: colorHex }}>
                          {tier.displayName}
                        </div>
                        
                        {!compact && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {tier.minRating.toFixed(1)} - {tier.maxRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Connector between paths (except after the last one) */}
                {path !== 'Foundation' && (
                  <div className="flex justify-center">
                    <ChevronRight className="h-6 w-6 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PathsVisualization;