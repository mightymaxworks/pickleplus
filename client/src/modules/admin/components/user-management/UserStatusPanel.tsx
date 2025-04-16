/**
 * PKL-278651-ADMIN-0015-USER
 * User Status Panel Component
 * 
 * Displays and allows management of user account status
 */

import { useState } from 'react';
import { UserAccountStatus } from '../../../../shared/types/admin/user-management';
import { formatDistance } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Check, Clock, Lock, Shield, UserCheck, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserStatusPanelProps {
  accountStatus: UserAccountStatus | null;
  onUpdateStatus: (statusData: { 
    status: 'active' | 'suspended' | 'restricted' | 'deactivated';
    reason?: string;
    expiresAt?: string;
  }) => void;
  isUpdating: boolean;
}

export const UserStatusPanel = ({ 
  accountStatus, 
  onUpdateStatus,
  isUpdating
}: UserStatusPanelProps) => {
  const [updatedStatus, setUpdatedStatus] = useState<'active' | 'suspended' | 'restricted' | 'deactivated'>(
    accountStatus?.status || 'active'
  );
  const [statusReason, setStatusReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleUpdateStatus = () => {
    onUpdateStatus({
      status: updatedStatus,
      reason: statusReason.trim()
    });
    setStatusReason('');
    setIsDialogOpen(false);
  };
  
  const getStatusInfo = () => {
    if (!accountStatus) {
      return {
        label: 'Active',
        description: 'This account is active and in good standing.',
        icon: <UserCheck className="h-6 w-6 text-green-500" />,
        variant: 'outline',
        badgeColor: 'success'
      };
    }
    
    switch (accountStatus.status) {
      case 'active':
        return {
          label: 'Active',
          description: 'This account is active and in good standing.',
          icon: <UserCheck className="h-6 w-6 text-green-500" />,
          variant: 'outline',
          badgeColor: 'success'
        };
      case 'suspended':
        return {
          label: 'Suspended',
          description: 'This account has been suspended and cannot be accessed.',
          icon: <UserX className="h-6 w-6 text-destructive" />,
          variant: 'destructive',
          badgeColor: 'destructive'
        };
      case 'restricted':
        return {
          label: 'Restricted',
          description: 'This account has limited access to certain features.',
          icon: <Lock className="h-6 w-6 text-amber-500" />,
          variant: 'warning',
          badgeColor: 'warning'
        };
      case 'deactivated':
        return {
          label: 'Deactivated',
          description: 'This account has been deactivated at the user\'s request.',
          icon: <Shield className="h-6 w-6 text-slate-500" />,
          variant: 'secondary',
          badgeColor: 'secondary'
        };
      default:
        return {
          label: 'Unknown',
          description: 'The status of this account is unknown.',
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
          variant: 'warning',
          badgeColor: 'warning'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Account Status</CardTitle>
        <CardDescription>Current account standing and restrictions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          {statusInfo.icon}
          <div>
            <h3 className="font-medium">{statusInfo.label}</h3>
            <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
          </div>
        </div>
        
        {accountStatus && (
          <>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={statusInfo.badgeColor as any}>
                  {accountStatus.status.toUpperCase()}
                </Badge>
              </div>
              
              {accountStatus.reason && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Reason</span>
                  <p className="text-sm p-2 bg-muted rounded-md">
                    {accountStatus.reason}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Updated</span>
                <span className="text-sm">
                  {formatDistance(new Date(accountStatus.createdAt), new Date(), { addSuffix: true })}
                </span>
              </div>
              
              {accountStatus.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Expires</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">
                      {formatDistance(new Date(accountStatus.expiresAt), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Change Status'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Account Status</DialogTitle>
              <DialogDescription>
                Change the status of this user account. This will affect what the user can access.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={updatedStatus === 'active' ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-3"
                  onClick={() => setUpdatedStatus('active')}
                >
                  <UserCheck className="h-5 w-5 mb-1" />
                  <span>Active</span>
                </Button>
                
                <Button
                  variant={updatedStatus === 'restricted' ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-3"
                  onClick={() => setUpdatedStatus('restricted')}
                >
                  <Lock className="h-5 w-5 mb-1" />
                  <span>Restricted</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant={updatedStatus === 'suspended' ? 'destructive' : 'outline'}
                      className="flex flex-col h-auto py-3"
                    >
                      <UserX className="h-5 w-5 mb-1" />
                      <span>Suspended</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspend Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This is a severe action that will prevent the user from accessing their account.
                        Use this for serious policy violations only.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => setUpdatedStatus('suspended')}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Continue with Suspension
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button
                  variant={updatedStatus === 'deactivated' ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-3"
                  onClick={() => setUpdatedStatus('deactivated')}
                >
                  <Shield className="h-5 w-5 mb-1" />
                  <span>Deactivated</span>
                </Button>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status-reason" className="text-sm font-medium">
                  Reason for status change
                </label>
                <Textarea
                  id="status-reason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Provide a reason for this status change..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be recorded in the administrative logs but will not be visible to the user.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={updatedStatus === 'suspended' ? 'destructive' : 'default'}
                onClick={handleUpdateStatus}
                disabled={!statusReason.trim() || isUpdating}
              >
                {isUpdating ? (
                  <>Updating...</>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};