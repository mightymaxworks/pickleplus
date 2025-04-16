/**
 * PKL-278651-ADMIN-0015-USER
 * User Action History Component
 * 
 * Displays the history of administrative actions taken on a user account
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminUserAction } from '../../../../shared/types/admin/user-management';
import { getUserAdminActions } from '@/lib/api/admin/user-management';
import { formatDistance } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, Loader2 } from 'lucide-react';

interface UserActionHistoryProps {
  actions: AdminUserAction[];
  expandable?: boolean;
  showLoadMore?: boolean;
  userId?: number;
}

export const UserActionHistory = ({ 
  actions, 
  expandable = false, 
  showLoadMore = false,
  userId
}: UserActionHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  
  // Query for more actions when needed
  const { 
    data: moreActionsData, 
    isLoading: isLoadingMore,
    isFetching: isFetchingMore,
    fetchNextPage,
    hasNextPage
  } = useQuery({
    queryKey: ['/api/admin/users', userId, 'actions', page],
    queryFn: () => getUserAdminActions(userId!, { page, limit: 10 }),
    enabled: showLoadMore && !!userId && page > 1,
  });
  
  // Combine initial actions with loaded actions
  const allActions = [...actions];
  if (moreActionsData && moreActionsData.actions) {
    // Only add actions that aren't already in the list
    const existingIds = new Set(allActions.map(a => a.id));
    moreActionsData.actions.forEach(action => {
      if (!existingIds.has(action.id)) {
        allActions.push(action);
      }
    });
  }
  
  // Toggle expanded state for an action
  const toggleExpanded = (actionId: number) => {
    if (expandable) {
      setIsExpanded(prev => ({
        ...prev,
        [actionId]: !prev[actionId]
      }));
    }
  };
  
  // Load more actions
  const handleLoadMore = () => {
    if (userId) {
      setPage(prev => prev + 1);
    }
  };
  
  // Get badge color based on action type
  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case 'UPDATE_STATUS':
        return 'warning';
      case 'UPDATE_PROFILE':
        return 'default';
      case 'ADD_NOTE':
        return 'secondary';
      case 'PERMISSION_CHANGE':
        return 'outline';
      default:
        return undefined;
    }
  };
  
  // Format action description
  const formatActionDescription = (action: AdminUserAction) => {
    // Return basic description
    return action.description;
  };
  
  // Display metadata if present and expanded
  const renderMetadata = (action: AdminUserAction) => {
    if (!action.metadata || !isExpanded[action.id]) return null;
    
    try {
      const metadataObj = JSON.parse(action.metadata);
      return (
        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
          <pre className="whitespace-pre-wrap font-mono">
            {JSON.stringify(metadataObj, null, 2)}
          </pre>
        </div>
      );
    } catch (e) {
      // If not valid JSON, just display as text
      return (
        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
          <p>{action.metadata}</p>
        </div>
      );
    }
  };
  
  if (allActions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No administrative actions recorded yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {allActions.map((action, index) => (
        <div key={action.id}>
          {index > 0 && <Separator className="my-3" />}
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Badge variant={getActionBadgeVariant(action.actionType)}>
                  {action.actionType.replace(/_/g, ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistance(new Date(action.createdAt), new Date(), { addSuffix: true })}
                </span>
              </div>
              {action.adminUsername && (
                <span className="text-xs">by {action.adminUsername}</span>
              )}
            </div>
            
            <p className="text-sm">
              {formatActionDescription(action)}
              {action.metadata && expandable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1 inline-flex"
                        onClick={() => toggleExpanded(action.id)}
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to {isExpanded[action.id] ? 'hide' : 'show'} details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </p>
            
            {renderMetadata(action)}
          </div>
        </div>
      ))}
      
      {showLoadMore && userId && (
        <div className="pt-2">
          {isLoadingMore || isFetchingMore ? (
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            moreActionsData?.pagination.hasMore && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLoadMore} 
                className="w-full"
              >
                Load More
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};