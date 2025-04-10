/**
 * PKL-278651-GAME-0005-GOLD
 * Claims List Component
 * 
 * Component for displaying and managing golden ticket claims.
 */

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClaimStatus } from '../../api/goldenTicketApi';
import { GoldenTicketClaim } from '@shared/golden-ticket.schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ClaimsListProps {
  claims: GoldenTicketClaim[];
  isLoading: boolean;
}

const ClaimsList: React.FC<ClaimsListProps> = ({ claims, isLoading }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation for updating claim status
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      return updateClaimStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket-claims'] });
      toast({
        title: 'Status Updated',
        description: 'Claim status has been updated',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update claim status',
        variant: 'destructive',
      });
      console.error('Error updating claim status:', error);
    }
  });
  
  const handleStatusChange = (id: number, status: string) => {
    mutation.mutate({ id, status });
  };
  
  const copyRedemptionCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: 'Copied',
        description: 'Redemption code copied to clipboard',
        variant: 'default',
      });
    });
  };
  
  // Helper function to get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed': return 'bg-yellow-100 text-yellow-800';
      case 'entered_drawing': return 'bg-purple-100 text-purple-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'redeemed': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (claims.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Ticket className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No claims</h3>
        <p className="mt-1 text-sm text-gray-500">
          No golden tickets have been claimed yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {claims.map((claim) => (
        <Card key={claim.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Claim #{claim.id}</h3>
                  <p className="text-xs text-gray-500">
                    User ID: {claim.userId} • 
                    <span className="ml-1">
                      Claimed on {format(new Date(claim.claimedAt), 'MMM d, yyyy')}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Ticket ID: {claim.ticketId}
                  </p>
                </div>
                <Badge className={getStatusColor(claim.status)}>
                  {formatStatus(claim.status)}
                </Badge>
              </div>
              
              {claim.redemptionCode && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                  <div className="font-mono text-xs">
                    Redemption code: <span className="font-semibold">{claim.redemptionCode}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => copyRedemptionCode(claim.redemptionCode || '')}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              )}
              
              {claim.redemptionDate && (
                <div className="text-xs text-gray-600">
                  Redeemed on: {format(new Date(claim.redemptionDate), 'MMM d, yyyy h:mm a')}
                </div>
              )}
              
              <div className="pt-2">
                <Select 
                  value={claim.status} 
                  onValueChange={(value) => handleStatusChange(claim.id, value)}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="entered_drawing">Entered in Drawing</SelectItem>
                    <SelectItem value="selected">Selected as Winner</SelectItem>
                    <SelectItem value="redeemed">Redeemed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClaimsList;