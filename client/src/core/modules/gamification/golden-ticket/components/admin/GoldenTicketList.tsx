/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket List Component
 * 
 * Component for displaying and managing golden tickets.
 */

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGoldenTicket } from '../../api/goldenTicketApi';
import { GoldenTicket } from '@shared/golden-ticket.schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoldenTicketListProps {
  tickets: GoldenTicket[];
  isLoading: boolean;
}

const GoldenTicketList: React.FC<GoldenTicketListProps> = ({ tickets, isLoading }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation for updating ticket status
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      return updateGoldenTicket(id, { status: status as any });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'golden-tickets'] });
      toast({
        title: 'Status Updated',
        description: 'Golden ticket status has been updated',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update golden ticket status',
        variant: 'destructive',
      });
      console.error('Error updating golden ticket status:', error);
    }
  });
  
  const handleStatusChange = (id: number, status: string) => {
    mutation.mutate({ id, status });
  };
  
  // Helper function to get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
  
  if (tickets.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Gift className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No tickets</h3>
        <p className="mt-1 text-sm text-gray-500">
          No golden tickets have been created yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {tickets.map((ticket) => {
        const isExpired = new Date(ticket.endDate) < new Date();
        const isFull = ticket.currentClaims >= ticket.maxClaims;
        
        return (
          <Card key={ticket.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{ticket.title}</h3>
                    <p className="text-sm text-gray-500">
                      {ticket.campaignId} • 
                      <span className="ml-1">
                        {format(new Date(ticket.startDate), 'MMM d')} - {format(new Date(ticket.endDate), 'MMM d, yyyy')}
                      </span>
                    </p>
                  </div>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Appearance Rate:</span>
                    <span>{ticket.appearanceRate}%</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Claims:</span>
                    <span>{ticket.currentClaims} / {ticket.maxClaims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sponsor:</span>
                    <span>{ticket.sponsorId ? `ID: ${ticket.sponsorId}` : 'None'}</span>
                  </div>
                </div>
                
                {(isExpired || isFull) && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                    <span className="text-amber-700">
                      {isExpired ? 'This ticket has expired.' : 'This ticket has reached maximum claims.'}
                    </span>
                  </div>
                )}
                
                <div className="pt-2">
                  <Select 
                    value={ticket.status} 
                    onValueChange={(value) => handleStatusChange(ticket.id, value)}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Set to Draft</SelectItem>
                      <SelectItem value="active">Set to Active</SelectItem>
                      <SelectItem value="paused">Set to Paused</SelectItem>
                      <SelectItem value="completed">Set to Completed</SelectItem>
                      <SelectItem value="cancelled">Set to Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GoldenTicketList;