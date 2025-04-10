/**
 * PKL-278651-GAME-0005-GOLD
 * Sponsor List Component
 * 
 * Component for displaying the list of sponsors.
 */

import React, { useState } from 'react';
import { Sponsor } from '@shared/golden-ticket.schema';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSponsor } from '../../api/goldenTicketApi';
import { useToast } from '@/hooks/use-toast';

interface SponsorListProps {
  sponsors: Sponsor[];
  isLoading: boolean;
}

const SponsorList: React.FC<SponsorListProps> = ({ sponsors, isLoading }) => {
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Delete sponsor mutation
  const deleteSponssorMutation = useMutation({
    mutationFn: deleteSponsor,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sponsor deleted successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sponsors'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete sponsor. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting sponsor:', error);
    }
  });
  
  // Handler for delete button click
  const handleDeleteClick = (id: number) => {
    setSelectedSponsorId(id);
    setConfirmDialogOpen(true);
  };
  
  // Handler for confirm delete
  const handleConfirmDelete = () => {
    if (selectedSponsorId !== null) {
      deleteSponssorMutation.mutate(selectedSponsorId);
      setConfirmDialogOpen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (sponsors.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No sponsors</h3>
        <p className="mt-1 text-sm text-gray-500">
          No sponsors have been added yet.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {sponsors.map((sponsor) => (
          <Card key={sponsor.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={sponsor.logoPath || ''} alt={sponsor.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {sponsor.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{sponsor.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={sponsor.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {sponsor.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteClick(sponsor.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {sponsor.description && (
                    <p className="text-sm text-gray-500 mt-1">{sponsor.description}</p>
                  )}
                  
                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    {sponsor.contactEmail && (
                      <div>Email: {sponsor.contactEmail}</div>
                    )}
                    
                    {sponsor.website && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="px-0 h-auto text-xs text-blue-600"
                        asChild
                      >
                        <a 
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          Visit website
                          <ExternalLink size={10} className="ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sponsor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SponsorList;