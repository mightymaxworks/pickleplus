/**
 * PKL-278651-ADMIN-0015-USER
 * User Action History Component
 * 
 * This component displays the history of administrative actions for a user
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
// Import pagination button components from UI library
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserActions } from '@/lib/api/admin/user-management';
import { formatDateTime } from '@/lib/utils';
import { AdminUserAction } from '@shared/types/admin/user-management';

interface UserActionHistoryProps {
  userId: number;
  initialActions: AdminUserAction[];
  showAllActions?: boolean;
}

export function UserActionHistory({ 
  userId, 
  initialActions,
  showAllActions = false
}: UserActionHistoryProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Fetch more actions if needed
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', userId, 'actions', page],
    queryFn: async () => await getUserActions(userId, page, pageSize),
    enabled: showAllActions,
    initialData: showAllActions ? undefined : { 
      actions: initialActions,
      pagination: {
        page: 1,
        pageSize,
        totalItems: initialActions.length,
        totalPages: 1
      }
    }
  });
  
  // If not showing all actions, just use the initial ones
  const actions = data?.actions || initialActions;
  const totalPages = data?.pagination?.totalPages || 1;
  
  // Format action details better
  const formatActionDetails = (action: AdminUserAction) => {
    if (!action.details) return null;
    
    try {
      // Try to parse JSON details
      const details = JSON.parse(action.details);
      return (
        <div className="text-xs space-y-1 mt-1">
          {Object.entries(details).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key}: </span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      // If not JSON, just return as string
      return <div className="text-xs mt-1">{action.details}</div>;
    }
  };
  
  // Get human readable action name
  const getActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      add_note: 'Added Note',
      update_status: 'Updated Status',
      update_profile: 'Updated Profile',
      grant_permission: 'Granted Permission',
      revoke_permission: 'Revoked Permission',
      login_success: 'Successful Login',
      login_failure: 'Failed Login Attempt',
      password_reset: 'Password Reset',
      email_change: 'Changed Email',
      account_create: 'Account Created',
      admin_view: 'Admin Viewed Profile',
    };
    
    return actionMap[action] || action;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {showAllActions ? 'Admin Action History' : 'Recent Actions'}
        </CardTitle>
        <CardDescription>
          {showAllActions
            ? 'Complete history of administrative actions on this user account'
            : 'Recent administrative actions on this user account'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : actions.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="align-top whitespace-nowrap">
                      {formatDateTime(action.createdAt)}
                    </TableCell>
                    <TableCell className="align-top">
                      {action.adminName || `Admin #${action.adminId}`}
                    </TableCell>
                    <TableCell className="align-top">
                      {getActionName(action.action)}
                    </TableCell>
                    <TableCell className="align-top">
                      {formatActionDetails(action)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {showAllActions && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data?.pagination?.totalItems || 0)} of {data?.pagination?.totalItems || 0} actions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // For more than 5 pages, show first, last, and pages around current
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (i === 0) {
                        pageNum = 1;
                      } else if (i === 4) {
                        pageNum = totalPages;
                      } else {
                        const middleOffset = Math.min(Math.max(page - 2, 0), totalPages - 5);
                        pageNum = i + 1 + middleOffset;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No administrative actions recorded for this user yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}