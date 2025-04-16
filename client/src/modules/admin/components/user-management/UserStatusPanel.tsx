/**
 * PKL-278651-ADMIN-0015-USER
 * User Status Panel
 * 
 * This component displays and allows admins to update user account status
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { updateUserStatus } from '@/lib/api/admin/user-management';
import { UserAccountStatus } from '@shared/types/admin/user-management';

interface UserStatusPanelProps {
  userId: number;
  currentStatus: UserAccountStatus | null;
}

export function UserStatusPanel({ userId, currentStatus }: UserStatusPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>(currentStatus?.status || 'active');
  const [reason, setReason] = useState<string>(currentStatus?.reason || '');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', icon: ShieldCheck, color: 'text-green-500' },
    { value: 'restricted', label: 'Restricted', icon: AlertTriangle, color: 'text-amber-500' },
    { value: 'suspended', label: 'Suspended', icon: ShieldX, color: 'text-red-500' },
    { value: 'deactivated', label: 'Deactivated', icon: ShieldAlert, color: 'text-gray-500' },
  ];
  
  // Get current status info
  const getStatusInfo = () => {
    return statusOptions.find(option => option.value === (currentStatus?.status || 'active')) 
      || statusOptions[0];
  };
  
  // Get status option by value
  const getStatusOption = (value: string) => {
    return statusOptions.find(option => option.value === value) || statusOptions[0];
  };
  
  // Handle status update
  const handleUpdateStatus = async () => {
    if (status === currentStatus?.status && !reason && !expiresAt) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateUserStatus(userId, {
        status: status as 'active' | 'suspended' | 'restricted' | 'deactivated',
        reason: reason || undefined,
        expiresAt: expiresAt || undefined,
      });
      
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      
      toast({
        title: 'Status Updated',
        description: `User status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Update Status',
        description: 'There was an error updating the user status. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Currently selected status
  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Status</CardTitle>
        <CardDescription>
          View and update account status
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current status display */}
        <div className="flex items-center gap-2 mb-4">
          <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
          <span className="font-medium">{statusInfo.label}</span>
          
          {currentStatus?.expiresAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Clock className="h-3 w-3" />
              <span>Until {formatDate(currentStatus.expiresAt)}</span>
            </div>
          )}
        </div>
        
        {/* Update status form */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => {
                  const OptionIcon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <OptionIcon className={`h-4 w-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          {status !== 'active' && (
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (Optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleUpdateStatus}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </Button>
      </CardFooter>
    </Card>
  );
}